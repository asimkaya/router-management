export interface CgiObject {
  stack: string;
  fields: Record<string, string>;
}

/**
 * Parse TP-Link CGI text responses such as:
 * [1,1,0,0,0,0]0
 * hostName=Phone
 * [error]0
 */
export function parseCgiResponse(body: string): CgiObject[] {
  const objects: CgiObject[] = [];
  let current: CgiObject | null = null;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("$.ret") || line === "[error]0") {
      continue;
    }

    const header = line.match(/^\[([0-9,]+)\]\d+$/);
    if (header) {
      current = { stack: header[1], fields: {} };
      objects.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }

    const key = line.slice(0, eq);
    const value = line.slice(eq + 1);
    current.fields[key] = value;
  }

  return objects;
}

export function buildActGl(
  oid: string,
  fields: string[],
  index = 0,
): string {
  const header = `[${oid}#0,0,0,0,0,0#0,0,0,0,0,0]${index},${fields.length}`;
  return `${header}\r\n${fields.map((f) => `${f}`).join("\r\n")}\r\n`;
}
