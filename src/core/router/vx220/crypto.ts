import forge from "node-forge";

/** Base64 used by TP-Link login pages (includes padding "="). */
export function tpLinkBase64(input: string): string {
  return forge.util.encode64(forge.util.encodeUtf8(input));
}

/** RSA PKCS#1 v1.5 encrypt → lowercase hex, padded to 256 chars (1024-bit keys). */
export function rsaEncryptToHex(
  plaintext: string,
  modulusHex: string,
  exponentHex: string,
): string {
  const publicKey = forge.pki.rsa.setPublicKey(
    new forge.jsbn.BigInteger(modulusHex, 16),
    new forge.jsbn.BigInteger(exponentHex, 16),
  );

  const encrypted = publicKey.encrypt(plaintext, "RSAES-PKCS1-V1_5");
  let hex = forge.util.bytesToHex(encrypted);
  while (hex.length < 256) {
    hex = `0${hex}`;
  }
  return hex;
}
