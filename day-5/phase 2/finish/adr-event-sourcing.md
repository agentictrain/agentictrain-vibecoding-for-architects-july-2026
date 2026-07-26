# ADR: Event Sourcing for the Order Service

## Status

Proposed — workshop PoC, not an approved decision.

## Context

The order service currently uses a simple CRUD model with PostgreSQL.
The team is evaluating whether to adopt event sourcing to capture all
state changes as an immutable event log.

## Decision

Adopt event sourcing for the order service, using Kafka as the event
store and PostgreSQL as a read-optimized projection.

## Drivers

- Need for an audit trail of all order state changes (stated in the
  problem).
- Desire for replay capability for debugging and analytics (stated in
  the problem).
- Team familiarity with Kafka (assumption — not stated in the problem).

## Alternatives considered

1. **Keep CRUD with PostgreSQL only.** Simpler, but no replay or audit
   trail.
2. **Use a CDC tool (Debezium) on PostgreSQL.** Captures changes
   without rewriting the service, but adds infrastructure complexity.

## Consequences

- **Positive:** full audit trail, replay capability, event-driven
  integration with downstream services.
- **Negative:** higher operational complexity (Kafka cluster), steeper
  learning curve, schema evolution challenges.
- **Open:** team familiarity with Kafka is assumed, not confirmed.

## Claims labeled

- "Need for an audit trail" — source evidence (from the problem).
- "Desire for replay" — source evidence (from the problem).
- "Team familiarity with Kafka" — assumption (not stated).
- "Schema evolution challenges" — model inference (reasonable for event
  sourcing).
- "Higher operational complexity" — model inference (reasonable for
  Kafka).

## Notes

This ADR was produced by a skill and then edited to label claims and
remove unsupported assertions. The original output invented a
compliance requirement ("PCI-DSS requires audit trails") that was not
in the problem statement — that claim was removed.