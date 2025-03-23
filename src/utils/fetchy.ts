export function post(path: string, body: any, headers?: Record<string, string>): Promise<any> {
  const res = fetch(path, {
    method: "POST",
    headers: {"content-type": "application/json", ...headers},
    body: JSON.stringify(body),
  })
  return res.then(res => res.json())
}

function getInner(path: string, query?: Record<string, string>, headers?: Record<string, string>): Promise<Response> {
  const params = String(new URLSearchParams(query ?? {}))
  const fullUrl = path + (params && `?${params}`)
  return fetch(fullUrl, {method: "GET", headers})
}

export function get(...args: Parameters<typeof getInner>): Promise<any> {
  return getInner(...args).then(res => res.json())
}

export function getText(...args: Parameters<typeof getInner>): Promise<any> {
  return getInner(...args).then(res => res.text())
}
