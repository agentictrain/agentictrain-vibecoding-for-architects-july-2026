# Meeting notes — Customer data sync, ERP EU / ERP Americas (draft, unreviewed)

**Date:** March 11 — **Taken by:** Jonas (sorry, typing fast, gaps everywhere)
**Attendees:** Marta (EA), Priya (Data), Tomás (ERP EU), Rachel (ERP Americas), Devon (Integration), Karim (CRM), (Legal joined late, left early)

---

Context recap from Marta: NorthGrove Foods runs two ERP instances since the Meridian acquisition — **NG-ERP-EU** (S/4HANA, Frankfurt) and **NG-ERP-AM** (older ECC, hosted in Ohio, migration "someday"). Customer master data lives in **CustomerHub** (our CRM) but both ERPs keep their own copies. Same customer exists 2–3 times with different IDs. Finance reconciliation eats days every quarter close.

Current state (Devon): nightly CSV export from CustomerHub → SFTP → custom load scripts on each ERP. The Americas load script fails "maybe once a week", nobody owns it since Stefan left. EU side mostly OK but 24h delay causes the credit-limit issue Tomás keeps raising.

Tomás: sales orders get blocked on stale credit limits. For him **near real-time sync is a must**, said "if a customer is updated in CustomerHub, ERP should know within minutes."

Rachel: pushed back — for Americas, **nightly batch is fine**, finance only needs it for month-end anyway. "Let's not gold-plate this." (Not resolved — parking lot.)

Volume question came up — Karim didn't have numbers, said "it's a lot of records, especially after Meridian". **TODO: Karim to pull actual record counts and change rates.** (didn't happen yet)

Options on the table (Devon whiteboarded, photo lost, from memory):

1. **iPaaS** — use the integration platform we already license for the e-invoicing flows. Devon likes it: monitoring, retries, connectors for both SAP and CustomerHub out of the box. Concern: per-connection licensing cost, and the platform team is a bottleneck (6-week lead time for new flows??)
2. **Point-to-point APIs** — CustomerHub webhooks calling ERP APIs directly. Cheapest to start, Tomás's team could build the EU side themselves. Marta worried this recreates the spaghetti we're trying to kill.
3. **Event broker** — publish customer-changed events, both ERPs (and future consumers) subscribe. Priya's favorite, "aligns with the platform strategy". Nobody in the room has run one in production. Ops question totally open.

Priya mentioned the **MDM tool her team is piloting** — might become the golden record for customers "eventually"?? Unclear if it's in scope for this. Marta: "don't couple this project to the pilot." Left it there.

Legal (before dropping off): reminded everyone customer data is personal data, "there are rules about customer data crossing regions, check with privacy office before you move anything." No specifics given. **TODO: someone to follow up with privacy office** (no owner assigned…)

Mood in the room: leaning iPaaS I think? Marta asked Devon to "sketch the decision properly" for the architecture board. **Next steps: Devon drafts decision doc, review in 2 weeks.** Rachel on PTO next week. [missed the last 5 min, hard stop]
