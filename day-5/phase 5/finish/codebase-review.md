# Codebase review — reference result

## Review provenance

- Repository: `https://github.com/expressjs/cookie-parser`
- Commit: `1f2a3a2037c4efe01605e064e7cc326008be7287`
- Reviewed files: `README.md`, `package.json`, `index.js`,
  `test/cookieParser.js`
- Skill: replace with the skill name, source URL, and install command you used
- Runtime verification: Node 22.23.2; 32 tests passed; lint passed

## Purpose and scope

`cookie-parser` is Express-compatible middleware that parses the incoming
`Cookie` request header into `req.cookies`. When supplied signing secrets, it
also validates `s:` values and exposes them through `req.signedCookies`.
Values prefixed with `j:` may be converted from JSON text to JavaScript
values. **SOURCE EVIDENCE:** `README.md:8-11,25-52` and `index.js:39-72`.
It does not create cookies, manage sessions, encrypt values, or provide an
HTTP server. **INFERENCE:** those capabilities are absent from the public
exports and the repository inventory.

## Public entry points and request flow

The package exports one middleware factory and four helper functions:
`JSONCookie`, `JSONCookies`, `signedCookie`, and `signedCookies`.
**SOURCE EVIDENCE:** `index.js:23-27`.

The middleware:

1. returns early when `req.cookies` already exists (`index.js:44-47`);
2. reads `req.headers.cookie` and initializes null-prototype cookie objects
   (`index.js:49-57`);
3. delegates header parsing to the `cookie` package (`index.js:60`);
4. validates and removes signed values from the ordinary cookie object when
   secrets exist (`index.js:62-66,163-181`);
5. converts eligible JSON-cookie values, then calls `next`
   (`index.js:68-71,83-118`).

## Trust boundaries

| Boundary | Observed behavior | Evidence |
| --- | --- | --- |
| Incoming `Cookie` header | Untrusted header text is passed to `cookie.parse` | `index.js:49,60` |
| Signing secret(s) | Caller input is normalized to an array; the first value is assigned to `req.secret` | `index.js:39-42,51` |
| Signed values | `s:` values are checked against each secret; failure becomes `false` | `index.js:129-150` |
| JSON values | `j:` values are parsed; parse errors return `undefined` | `index.js:83-92` |
| Request object | Middleware writes `secret`, `cookies`, and `signedCookies` | `index.js:51-53` |
| Decode behavior | Caller options are forwarded to the `cookie` dependency | `README.md:34-36`; `index.js:39,60` |

## Verified findings

### 1. README and helper behavior disagree

The README says `JSONCookie` returns the passed value when it is not a JSON
cookie (`README.md:54-57`). The function instead returns `undefined`
(`index.js:83-86`), and the tests explicitly expect that behavior
(`test/cookieParser.js:139-154`). **Status: corrected documentation claim.**

### 2. Valid falsy JSON values are not inflated by `JSONCookies`

`JSONCookie('j:false')` correctly returns `false`, but `JSONCookies` replaces
the original string only when the parsed result is truthy
(`index.js:103-115`). Therefore `j:false`, `j:0`, and `j:null` remain strings
when processed through the object helper. The test suite covers a truthy
object and malformed JSON but not these valid falsy values
(`test/cookieParser.js:35-47,156-161`). **Status: source evidence plus
executable probe; behavior gap confirmed.**

### 3. Installation is not fully reproducible

There is no committed lockfile, and Mocha uses a version range while most
development dependencies are old pins (`package.json:23-33`). On the
workshop host, installing the current transitive tree and running `npm test`
under Node 26.5.0 failed in `yargs` before any project test ran. Running the
same installed tree under Node 22.23.2 produced 32 passing tests, and lint
passed. **Status: command evidence; this is a development-toolchain risk,
not evidence that middleware behavior failed.**

### 4. Existing middleware order changes behavior

If earlier middleware already created `req.cookies`, this middleware exits
without setting `req.secret` or `req.signedCookies` (`index.js:44-47`). A
test confirms that it leaves the existing cookie object unchanged
(`test/cookieParser.js:50-70`). Consumers need deliberate middleware
ordering. **Status: source evidence.**

### 5. Invalid signed and JSON values have different contracts

A tampered `s:` value produces `false` (`index.js:142-150`), while malformed
`j:` text remains its original string after `JSONCookies` because
`JSONCookie` returns `undefined` (`index.js:88-92,110-114`). Tests cover both
outcomes (`test/cookieParser.js:42-47,181-186,219-246`). Callers must not
assume all parsed values share one type. **Status: source and test evidence.**

## Claims removed or narrowed

- **“This package encrypts cookies.” — unsupported.** The implementation
  validates signatures; it does not encrypt values.
- **“It has no tests.” — false.** `test/cookieParser.js` exercises the
  middleware and all four helpers.
- **“Invalid JSON throws.” — false.** `JSON.parse` is inside `try/catch`.
- **“A Node 26 test failure proves the library is broken.” — overclaim.**
  The observed failure occurs in the installed test tooling before project
  tests execute.

## Commands and results

```text
git rev-parse HEAD
→ 1f2a3a2037c4efe01605e064e7cc326008be7287

npm install --ignore-scripts --no-package-lock --no-audit --no-fund
→ completed; emitted deprecation warnings for development dependencies

npm test  # Node 26.5.0
→ failed in yargs before tests started

node --version  # organization-approved Node 22 environment
→ v22.23.2

npm test
→ 32 passing

npm run lint
→ passed with no output
```

## Skill decision

Do not copy the reference decision. Keep the skill only if it stayed
read-only, cited real files precisely, distinguished evidence from inference,
and helped find or validate material behavior. Remove it if it invented
structure, hid uncertainty, or made changes during a review.
