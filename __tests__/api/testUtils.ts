export function createReqRes(method: string, { query = {}, body = {} }: { query?: any; body?: any } = {}) {
  const req: any = { method, query, body };
  const statusData: any = { statusCode: 200, jsonData: null, headers: {} };
  const res: any = {
    setHeader: (k: string, v: string) => { statusData.headers[k] = v; },
    status: (code: number) => { statusData.statusCode = code; return res; },
    json: (data: any) => { statusData.jsonData = data; return res; },
    _getJSON: () => statusData.jsonData,
    _getStatus: () => statusData.statusCode,
    _getHeaders: () => statusData.headers,
  };
  return { req, res };
}
