# Architecture review: e-commerce checkout service

## Findings

### Performance

- **No cache.** Source evidence — the description says "no cache." A
  cache would reduce database load for repeated product lookups.
- **No CDN.** Source evidence — the description says "no CDN." Static
  assets are served from the single VM, which adds latency for distant
  users.
- **Single VM bottleneck.** Source evidence — "deployed on a single
  VM." No horizontal scaling. A traffic spike or VM failure takes down
  the whole service.

### Availability

- **No redundancy.** Source evidence — single VM, single backend, no
  queue. If the VM fails, the service is down.
- **No queue for async processing.** Source evidence — "no queue."
  Payment and order creation are synchronous. A Stripe timeout blocks
  the user.
- **No backup strategy mentioned.** Model inference — the description
  doesn't mention backups. PostgreSQL on a single VM with no backup is
  a data-loss risk.

### Security

- **No rate-limiting mentioned.** Model inference — not stated, but a
  checkout endpoint without rate-limiting is vulnerable to abuse.
- **Stripe key management not described.** Model inference — the
  description mentions Stripe but not how the API key is stored. On a
  single VM, a key in environment variables is common but not ideal.

### Findings removed (unsupported)

- ~~"GDPR requires data residency for EU customers."~~ — Unsupported.
  The description doesn't mention EU customers, GDPR, or data
  residency.
- ~~"PCI-DSS Level 1 compliance is required."~~ — Unsupported. The
  description says Stripe handles payments, which typically offloads
  PCI scope. No compliance level was stated.

### Missing NFRs not mentioned by the skill

- **Observability.** No logging, monitoring, or alerting described.
  For a checkout service, this is a significant gap.
- **Disaster recovery.** No RTO/RPO defined. If the VM dies, how long
  until the service is back, and how much data is lost?

## Claims labeled

- "No cache" / "No CDN" / "Single VM" — source evidence.
- "No backup strategy" — model inference (reasonable).
- "No rate-limiting" — model inference (reasonable).
- "GDPR requires data residency" — unsupported claim (removed).
- "PCI-DSS Level 1 required" — unsupported claim (removed).