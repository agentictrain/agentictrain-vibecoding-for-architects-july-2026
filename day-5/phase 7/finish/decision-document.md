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

- Alice (tech lead) — confirmed the SQS decision.
- Carlos (backend) — explicitly said, “Agreed. SQS for now.”
- Dana (data) — explicitly accepted batching from the database for now.
- Bob (infra) — preferred not to run Kafka for one service. This supports
  the SQS direction, but he did not explicitly say that he agreed to SQS.

No one objected, and every participant either agreed or expressed a
compatible position. Treating that as consensus is a reasonable inference,
not a direct statement from the transcript.

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
- "No one objected" — source evidence.
- "The decision was reached by consensus" — model inference from the recorded
  positions, not a direct statement.

### Claims removed

- ~~"Dana raised concerns about data latency."~~ — Unsupported. Dana did
  not raise latency concerns. She said replay would be nice but agreed
  to batch from the DB.
- ~~"The team agreed to revisit in Q3."~~ — Unsupported. No timeline was
  discussed. The only open item is Bob's multi-region investigation for
  next week.
