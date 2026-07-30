# ADR: Event sourcing for the order service

## Status

Proposed workshop decision. Production approval requires the open questions
below to be resolved.

## Context

The order service currently stores current state through a CRUD model in
PostgreSQL. The team needs a trace of every order-state change and wants
replay for debugging and analytics. No event store or delivery platform has
been selected. Operational capacity, retention, consistency requirements,
and team experience are unknown.

## Decision

Run a bounded proof of concept for event-sourced order-state changes while
the production service remains on its current CRUD model. The proof of
concept must validate replay, projections, failure recovery, and operational
cost before a production adoption decision. This ADR does not select Kafka
or another event-store implementation.

## Drivers

- A trace of every order-state change. **Source evidence.**
- Replay for debugging and analytics. **Source evidence.**
- An implementation decision that does not invent an event store or
  operational capability. **Source evidence plus decision constraint.**

## Alternatives considered

1. **Adopt event sourcing in production immediately.** This can satisfy the
   trace and replay needs, but the unknown operational and consistency
   requirements make immediate adoption premature. **Model inference.**
2. **Keep CRUD with no additional history.** This preserves the current
   design but does not meet the stated trace and replay needs.
   **Source evidence.**
3. **Add an append-only audit log or change-data-capture pipeline.** These
   options may address part of the need with less application redesign, but
   their suitability requires investigation. **Model inference.**

## Consequences

- The team gets evidence before committing to a production architecture.
  **Model inference.**
- The proof of concept adds short-term work and does not immediately deliver
  production replay. **Model inference.**
- Event-store technology, delivery semantics, retention, projection rebuild
  time, consistency requirements, and support ownership remain open.
  **Source evidence for the unknowns; model inference for the evaluation
  details.**

## Validation and open questions

- Which event-store implementations meet the required semantics?
- What consistency and delivery guarantees does the order workflow require?
- How much history must be retained, and how quickly must replay complete?
- Who will operate and support the selected platform?
- What production success criteria will turn the proof of concept into an
  adoption or rejection decision?

## Claims removed

- ~~“Kafka is the event store.”~~ — Unsupported; no platform was selected.
- ~~“The team already operates Kafka.”~~ — Unsupported; team experience
  and operational capacity are unknown.
- ~~“PCI-DSS requires event sourcing.”~~ — Unsupported; no compliance
  requirement was provided.
