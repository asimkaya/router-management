use once_cell::sync::Lazy;
use parking_lot::Mutex;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, COOKIE, SET_COOKIE};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use std::time::Duration;

static SESSION: Lazy<Mutex<SessionState>> = Lazy::new(|| Mutex::new(SessionState::default()));

#[derive(Default)]
struct SessionState {
    cookies: HashMap<String, String>,
    client: Option<Client>,
}

impl SessionState {
    fn client(&mut self) -> Result<Client, String> {
        if self.client.is_none() {
            let client = Client::builder()
                .timeout(Duration::from_secs(12))
                .danger_accept_invalid_certs(false)
                .build()
                .map_err(|e| e.to_string())?;
            self.client = Some(client);
        }
        Ok(self.client.as_ref().unwrap().clone())
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub cookies: HashMap<String, String>,
}

#[tauri::command]
pub async fn router_http(request: HttpRequest) -> Result<HttpResponse, String> {
    let (client, cookie_header) = {
        let mut session = SESSION.lock();
        let client = session.client()?;
        let cookie_header = if session.cookies.is_empty() {
            None
        } else {
            Some(
                session
                    .cookies
                    .iter()
                    .map(|(k, v)| format!("{k}={v}"))
                    .collect::<Vec<_>>()
                    .join("; "),
            )
        };
        (client, cookie_header)
    };

    let method = reqwest::Method::from_str(&request.method.to_uppercase())
        .map_err(|_| format!("Unsupported HTTP method: {}", request.method))?;

    let mut headers = HeaderMap::new();
    if let Some(map) = &request.headers {
        for (key, value) in map {
            let name = HeaderName::from_str(key).map_err(|e| e.to_string())?;
            let val = HeaderValue::from_str(value).map_err(|e| e.to_string())?;
            headers.insert(name, val);
        }
    }
    if let Some(cookie) = cookie_header {
        headers.insert(
            COOKIE,
            HeaderValue::from_str(&cookie).map_err(|e| e.to_string())?,
        );
    }

    let mut builder = client.request(method, &request.url).headers(headers);
    if let Some(body) = &request.body {
        builder = builder.body(body.clone());
    }

    let response = builder.send().await.map_err(|e| e.to_string())?;
    let status = response.status().as_u16();

    let mut response_headers = HashMap::new();
    for (key, value) in response.headers().iter() {
        if let Ok(v) = value.to_str() {
            response_headers.insert(key.to_string(), v.to_string());
        }
    }

    let set_cookies: Vec<String> = response
        .headers()
        .get_all(SET_COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok().map(|s| s.to_string()))
        .collect();

    let body = response.text().await.map_err(|e| e.to_string())?;

    let mut session = SESSION.lock();
    for raw in set_cookies {
        if let Some((pair, _)) = raw.split_once(';') {
            if let Some((name, value)) = pair.split_once('=') {
                session
                    .cookies
                    .insert(name.trim().to_string(), value.trim().to_string());
            }
        }
    }

    Ok(HttpResponse {
        status,
        headers: response_headers,
        body,
        cookies: session.cookies.clone(),
    })
}

#[tauri::command]
pub fn router_clear_session() {
    let mut session = SESSION.lock();
    session.cookies.clear();
}
