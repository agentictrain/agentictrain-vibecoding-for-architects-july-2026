# Debug notes

## 2026-07-23 ollama cloud browser CORS failure

### Symptom

The browser request to `https://ollama.com/v1/chat/completions` showed no HTTP
status or response headers. The app displayed its generic endpoint/network/CORS
error and kept Region 2 weather evidence visible.

The shared screenshot contained a temporary bearer credential. That credential
must be revoked or rotated; it is not copied into this record.

### Check

Ran a credential-free preflight matching the direct `file://` browser request:

```text
curl -sS -D - -o /dev/null -X OPTIONS \
  "https://ollama.com/v1/chat/completions" \
  -H "Origin: null" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

### Result

The endpoint returned HTTP 405 with no `Access-Control-Allow-Origin`,
`Access-Control-Allow-Methods`, or `Access-Control-Allow-Headers` response
headers. The browser therefore blocks the request during CORS preflight before
the authenticated POST is sent.

### Resolution boundary

No client-side request change can bypass this policy while retaining the
required Bearer header and JSON body. Serving the page over HTTP would change
the origin but would not make an endpoint that rejects `OPTIONS` accept the
preflight. A proxy, backend, or CORS shim is forbidden by `TECH.md` and
the former Ollama contract.

The original endpoint would have needed to answer `OPTIONS` for
the workshop origin and allows:

- the workshop origin (`null` for direct `file://`, if direct opening remains
  required)
- method `POST`
- headers `Authorization` and `Content-Type`

### Resolution

The approved Groq Free tier migration supersedes the blocked Ollama endpoint.
A credential-free preflight to
`https://api.groq.com/openai/v1/chat/completions` returned HTTP 204 with
`Access-Control-Allow-Origin: *` and allowed the required method and headers for
both `Origin: null` and localhost. The active contract is in `GroqAPI.md`.