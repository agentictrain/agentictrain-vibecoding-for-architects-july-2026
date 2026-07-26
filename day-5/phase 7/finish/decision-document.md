# Decision document: Message broker for the order service

## Decision

Use Amazon SQS as the message broker for the new order service. Revisit
if replay capability becomes a hard requirement.

## Rationale

- The order service does not need replay or ordering guarantees across
  consumers (Carlos).
- Running a Kafka cluster for a single service is operationally heavy
  (Bob).
- Analytics can batch from the database instead of relying on broker
  replay (Dana).
- The trade-off is ops cost vs replay. The team chose lower ops cost
  now, with the option to revisit (Alice).

## Who agreed

- Alice (tech lead) — proposed SQS, confirmed the decision.
- Bob (infra) — preferred not to run a Kafka cluster.
- Carlos (backend) — agreed SQS is simpler, accepted the loss of
  ordering guarantees.
- Dana (data) — agreed to batch from DB for analytics.

No one objected. The decision was reached by consensus.

## Open questions

- What happens if SQS has a regional outage? Bob will investigate
  multi-region options for next week.
- When should we revisit the replay question? No date set.

## Claims labeled

- "The order service does not need replay" — source evidence (Carlos
  said it).
- "Running a Kafka cluster is operationally heavy" — source evidence
  (Bob said it).
- "Analytics can batch from the DB" — source evidence (Dana said it).
- "The decision was reached by consensus" — source evidence (no one
  objected, Alice confirmed).

### Claims removed

- ~~"Dana raised concerns about data latency."~~ — Unsupported. Dana did
  not raise latency concerns. She said replay would be nice but agreed
  to batch from the DB.
- ~~"The team agreed to revisit in Q3."~~ — Unsupported. No timeline was
  discussed. The only open item is Bob's multi-region investigation for
  next week.