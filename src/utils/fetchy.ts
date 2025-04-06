export function post<T = any>(path: string, body: any, headers?: Record<string, string>): Promise<T> {
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

export function get<T = any>(...args: Parameters<typeof getInner>): Promise<T> {
  return getInner(...args).then(res => res.json())
}

export function getText(...args: Parameters<typeof getInner>): Promise<string> {
  return getInner(...args).then(res => res.text())
}
