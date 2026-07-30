# Architecture review: e-commerce checkout service

## Findings

### Performance

- **No cache is described.** Source evidence — the description says "no
  cache." Whether a cache is needed depends on workload and measured database
  pressure. **Model inference.**
- **No CDN is described.** Source evidence — the description says "no CDN."
  If no other edge-delivery layer exists, distant users may see higher static
  asset latency. **Conditional model inference.**
- **The described deployment uses one VM.** Source evidence. This creates a
  likely scaling limit and single point of failure unless an unmentioned
  failover layer exists. **Model inference.**

### Availability

- **No redundancy is described.** Source evidence — the description names
  one backend deployment and no redundant components. A VM failure may take
  down the service. **Model inference.**
- **No queue is described.** Source evidence. Payment and order creation may
  therefore be coupled to the request path, but the description does not
  prove that they are synchronous. **Model inference.**
- **No backup strategy is described.** Source evidence by omission. Missing
  backup, restore, RTO, and RPO decisions create an unresolved data-loss and
  recovery risk; the database's deployment location is unknown.
  **Model inference.**

### Security

- **No rate-limiting mentioned.** Model inference — not stated, but a
  checkout endpoint without rate-limiting is vulnerable to abuse.
- **Stripe key management is not described.** Source evidence by omission.
  Secret storage, rotation, and access controls require confirmation.
  **Model inference.**

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

- "No cache" / "No CDN" / "Single VM" — source observations; their impact is
  model inference.
- "No backup strategy described" — source observation; data-loss impact is
  model inference.
- "No rate-limiting described" — source observation; abuse impact is model
  inference.
- "GDPR requires data residency" — unsupported claim (removed).
- "PCI-DSS Level 1 required" — unsupported claim (removed).
