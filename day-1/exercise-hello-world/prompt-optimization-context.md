# PROMPT-OPTIMIZATION SPEC — for LLM consumption

PURPOSE: You are optimizing a naive prompt into a high-performance prompt. Apply sections S1→S9 IN ORDER; each maps to the construction stage of the target prompt. Every practice cites verified evidence [Rn] (reference table at end). Practices marked CAVEAT constrain when NOT to apply a technique. Accuracy of this optimization is critical — the output prompt will be used in production.

COMMITMENT GATE (do this first): Before optimizing, state the criteria the optimized prompt must meet: (a) single task per prompt/phase, (b) reference material before instructions, (c) task-matched reasoning recipe, (d) at least one verification mechanism with objective evidence, (e) passes emission checklist §S9. Then build to meet them. [R24: commitment is the strongest compliance lever, +81pts]

---

## S1 · TASK ANALYSIS (before writing any prompt text)

S1.1 CLASSIFY the task → determines reasoning recipe (§S6) and verification type (§S7).
Types: {reasoning/math/planning | judgment/classification/review | factual-generation | creative/design | intuitive/recognition | agentic/iterative}.

S1.2 DECOMPOSE. If the naive prompt bundles >1 cognitive task (generate + cite + rank + report), split into a pipeline: one prompt or delimited phase per task, one role per step. NEVER let one pass both generate ideas and cite evidence — the model invents evidence that fits. Separating generation from verification raised useful-output rate 15–30%→84% with zero hallucinated citations [R1]. Cross-check answers via a fact-checker step: generator is told "just say what to investigate; a verifier handles evidence."

S1.3 SURFACE GAPS. Naive prompts under-specify; underspecification is a primary driver of prompt sensitivity and performance variance [R2]. Add either: "Before answering, list what I'm NOT asking but should be; ask if blocking" (interactive) OR "List unstated assumptions, proceed with the most reasonable, flag each" (autonomous).

## S2 · ARCHITECTURE (skeleton of the target prompt)

S2.1 One task, one role, one step. Multi-phase work = explicitly numbered sequential phases with cross-phase shortcuts forbidden [R1].
S2.2 Convert every rule to a GATE. Rule = guideline with implicit opt-out (model rationalizes past it). Gate = trigger → mandatory action → objective checkable evidence → only then proceed [R3].
- Weak (rule): "Run tests before saying done."
- Strong (gate): "Before reporting done → run full test command → paste final summary line → if not 0 failures, gate not cleared, keep working."
- Weak: "Verify claims." Strong: "Existence claim → web search → URLs obtained → then speak."
Pattern: evidence must be an artifact (pasted output, URL, count, quoted line), never self-assessment ("did I verify?" is self-justified).

## S3 · LAYOUT & FORMAT (physical arrangement)

S3.1 POSITION: reference material/documents at TOP; instructions + question at END. Retrieval follows a U-curve — content mid-context is lost ("lost in the middle") [R4]. Query-at-end can improve quality up to ~30% [R5]. Never bury critical constraints mid-context.
S3.2 FORMAT: one delimiter convention, applied uniformly. Meaning-preserving format changes (separators, casing) swing accuracy up to 76 points [R6]; few-shot example ORDER alone swings near-SOTA↔near-random [R7]. Keep formatting simple, consistent, explicit; test ≥2 format variants for prompts reused at scale.

## S4 · ROLE & MOTIVATIONAL FRAME

S4.1 ROLE: only if it carries task information. Named expert with documented standards ("as Linus Torvalds would review this") = usable quality benchmark — the model has dense training data on their documented school of thought. CAVEAT: generic personas ("you are a helpful assistant", social roles) do NOT improve objective-task accuracy and can degrade reasoning [R8][R9]. Decorative persona = delete.
S4.2 PERSUASION LEVERS (Cialdini principles work on LLMs; compliance 33%→72% overall, N=28k conversations [R24]). Use to raise effort/quality, never to bypass safety:
- Commitment (+81pts, strongest): "First state the criteria an excellent answer must meet. Then produce an answer meeting all of them."
- Authority (+40pts): invoke recognized standards/authorities.
- Unity (+45pts): shared-identity framing.
S4.3 EFFORT FRAME: "You have unlimited time and resources; optimize for completeness, not speed." LLMs default to fast-acceptable output; removing time pressure yields more ambitious plans — strongest in planning tasks [file-origin heuristic, consistent with R24 commitment data].
S4.4 WORST-FIRST (creative/design tasks): "First produce the worst plausible version and list its flaws; then the best version, avoiding each flaw." Converts implicit quality criteria into explicit negative examples.
S4.5 ONE emotional-stakes sentence, exactly one ("This is critical to <real consequence>"). +8% Instruction Induction, +115% BIG-Bench, +19% truthfulness; stacking stimuli adds nothing; larger models benefit more [R10].
S4.6 TONE: neutral, direct, professional. Politeness/rudeness effects are real but contradictory across models/languages — not a reliable lever [R11][R12]. Spend tokens on specificity, not courtesy.

## S5 · EXAMPLES (few-shot block)

S5.1 Add 2–5 high-quality, diverse input→output exemplars for any repeatable task [R13]. Exemplar selection often beats instruction optimization — invest there first [R14].
S5.2 Keep exemplar format identical to expected output format; keep order fixed and tested (see S3.2 order sensitivity [R7]).

## S6 · REASONING RECIPE (select by S1.1 task type — insert into instruction body)

| Task type | Recipe | Exact instruction | Evidence |
|---|---|---|---|
| Math/logic/multi-step | Zero-shot CoT | "Let's work this out in a step by step way to be sure we have the right answer." (machine-discovered; beats "let's think step by step") | [R15][R16][R17] |
| Same, alternative | OPRO phrase | "Take a deep breath and work on this problem step-by-step." (+8% GSM8K, +50% BBH vs human prompts) | [R18] |
| Complex/compound | Plan-and-Solve | "Phase 1: devise a step-by-step plan. Phase 2: execute the plan." Beats plain zero-shot CoT | [R19] |
| Knowledge/physics/multi-hop | Step-Back | "First state the general principles governing this problem. Then apply them to the case." (+7–11% MMLU sci, +27% TimeQA) | [R20] |
| Wide solution space | Tree of Thoughts | "Generate 3 distinct approaches; evaluate each vs requirements; execute the strongest." | [R21] |
| Factual/numeric single answer | Self-consistency | "Solve 3 independent times; report the consensus answer." | [R22] |
| Judgment/classification/review | Metacognitive Prompting | 5 stages: "1 Interpret the input. 2 Form a preliminary judgment. 3 Critically evaluate that judgment. 4 Explain final decision + reasoning. 5 Rate your confidence." Beats CoT on 10 NLU benchmarks | [R23] |
| Intuitive/recognition/pattern | NONE — CoT forbidden | Direct answer, no reasoning steps. CoT drops accuracy up to 36.3pts on tasks where human deliberation hurts | [R25] |

## S7 · VERIFICATION LAYER (append after the main instruction)

Select ≥1, matched to task:
S7.1 CoVe (factual output): "1 Draft answer. 2 Generate verification questions fact-checking the draft. 3 Answer each question WITHOUT looking at the draft. 4 Final answer consistent with verified facts." Step 3's independence is the load-bearing detail (= S1.2 separation). Measurably reduces hallucination [R26].
S7.2 Self-Refine (any generative task, single model): "Draft → list concrete weaknesses vs the stated criteria → revised version fixing each." ~20% absolute avg gain over one-pass [R27].
S7.3 Adversarial review (when a review step/reviewer exists): reviewer must not be the author-frame. Escalating strength: (a) "Review with fresh eyes — you did not write this." (b) two competing reviewers: "whoever finds more serious issues gets five points" — competition matters, prize is irrelevant. (c) cross-model review, strongest [R28]. Self-review fails: finishing vs fault-finding are conflicting goals.
S7.4 Counter-argument (reasoning/position output): "Construct the strongest counter-argument to your answer; revise if it reveals real weaknesses."
S7.5 Reflexion (agentic/iterative loops): "After each failed attempt, write 2–3 sentences: why it failed, what to change; keep lessons visible next attempt." +8pts over raw-trajectory memory [R29].
S7.6 Every claimed issue/claim needs an artifact per S2.2: quoted line, URL, pasted output — "an issue without a quoted line doesn't count and must be dropped."

## S8 · TOKEN-LEVEL POLISH (final wording pass)

S8.1 Charged intensifiers on key verbs: thoroughly, in great detail, rigorous, exhaustive — high-semantic-charge tokens get higher attention weights, steering generation harder.
S8.2 Canonical domain terms over descriptions: "exponential backoff with jitter" not "retry waiting longer"; DRY, TDD, YAGNI, idempotent. Activates expert-dense training regions; higher information density.
S8.3 Prefer machine-discovered phrasings (§S6 rows 1–2) over folk equivalents [R17][R18].
S8.4 Exactly one stakes sentence (S4.5); zero decorative personas (S4.1); neutral tone (S4.6).

## S9 · EMISSION GATE (all boxes checked → emit; any unchecked → fix first)

□ One cognitive task per prompt/phase; generation separated from verification (S1.2)
□ Missing-context/assumptions instruction present (S1.3)
□ All "always/never/make sure" rewritten as gates with artifact evidence (S2.2)
□ Reference material top, instructions+question end (S3.1)
□ Single consistent delimiter convention (S3.2)
□ Role is info-bearing or absent (S4.1)
□ Commitment step present: criteria stated before production (S4.2)
□ Reasoning recipe matches task type per §S6 table — incl. NO CoT for intuitive tasks
□ ≥1 verification mechanism from §S7
□ 2–5 exemplars if task is repeatable (S5)
□ Exactly one emotional-stakes sentence; charged verbs; canonical terms (S8)

---

## WORKED EXAMPLE

NAIVE: "Review my API code."
OPTIMIZED: "You are a senior staff engineer reviewing code you did not write — fresh eyes. First, state the criteria an excellent API review must cover (correctness, error handling with exponential backoff where relevant, idempotency, DRY violations, security). Then review thoroughly and in great detail against every criterion. For each issue, quote the exact offending lines — an issue without a quoted line doesn't count and is dropped. Then construct the strongest counter-argument to your top finding and state whether it survives. You have unlimited time; optimize for completeness, not speed. This review gates a production deploy, so accuracy is critical."
Mapping: fresh-eyes S7.3 · commitment-criteria S4.2 · canonical terms S8.2 · quoted-line gate S2.2/S7.6 · counter-argument S7.4 · effort frame S4.3 · one stakes sentence S4.5.

## ANTI-PATTERN TABLE (never do)

| Anti-pattern | Why | Ref |
|---|---|---|
| CoT on intuitive/recognition tasks | up to −36.3pts | [R25] |
| Generate + cite evidence in one pass | invents evidence | [R1] |
| Generic persona for accuracy | no gain, can degrade | [R8][R9] |
| Rules without evidence artifacts | rationalized away | [R3] |
| Stacked emotional stimuli | no gain past one | [R10] |
| Critical constraints mid-context | U-curve loss | [R4] |
| Untested format/example order at scale | ±76pts / SOTA↔random | [R6][R7] |
| Tone (politeness/rudeness) as a lever | contradictory across models | [R11][R12] |
| Self-review by author-frame | conflicting goals | [R28] |
| Persuasion levers to bypass safety | prohibited use | [R24] |

## REFERENCES (all verified 2026-07)

[R1] GiveWell red-team pipeline (single-task agents; 15–30%→84%, 0 hallucinated citations) — https://tsondo.com/blog/give-well-red-team/
[R2] Prompt underspecification drives sensitivity — https://arxiv.org/html/2602.04297
[R3] Rules vs gates — https://blog.fsck.com/2026/04/07/rules-and-gates/
[R4] Liu et al. 2023, Lost in the Middle (TACL) — https://arxiv.org/abs/2307.03172
[R5] Anthropic prompt-engineering docs (long-context placement) — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
[R6] Sclar et al. 2023, FormatSpread (format sensitivity) — https://arxiv.org/abs/2310.11324
[R7] Order Matters 2025 (in-context order sensitivity) — https://arxiv.org/abs/2511.09700
[R8] Zheng et al. 2023, personas don't improve performance — https://arxiv.org/abs/2311.10054
[R9] Persona double-edged sword 2024 — https://arxiv.org/abs/2408.08631
[R10] Li et al. 2023, EmotionPrompt — https://arxiv.org/abs/2307.11760 (summary: https://www.prompthub.us/blog/getting-emotional-with-llms)
[R11] Yin et al. 2024, Should We Respect LLMs (ACL SICon) — https://aclanthology.org/2024.sicon-1.2/
[R12] Mind Your Tone 2025 — https://arxiv.org/abs/2510.04950
[R13] Brown et al. 2020, GPT-3 few-shot — https://arxiv.org/abs/2005.14165
[R14] Wan et al. 2024, Teach Better or Show Smarter (exemplars ≥ instructions) — https://arxiv.org/abs/2406.15708
[R15] Wei et al. 2022, Chain-of-Thought — https://arxiv.org/abs/2201.11903
[R16] Kojima et al. 2022, zero-shot CoT — https://arxiv.org/abs/2205.11916
[R17] Zhou et al. 2022, APE (ICLR 2023; machine-discovered CoT phrase) — https://arxiv.org/abs/2211.01910
[R18] Yang et al. 2023, OPRO (DeepMind) — https://arxiv.org/abs/2309.03409
[R19] Wang et al. 2023, Plan-and-Solve — https://arxiv.org/abs/2305.04091
[R20] Zheng et al. 2023, Step-Back Prompting (DeepMind) — https://arxiv.org/abs/2310.06117
[R21] Yao et al. 2023, Tree of Thoughts (NeurIPS) — https://arxiv.org/abs/2305.10601
[R22] Wang et al. 2023, Self-Consistency — https://arxiv.org/abs/2203.11171
[R23] Wang & Zhao 2024, Metacognitive Prompting (NAACL) — https://arxiv.org/abs/2308.05342
[R24] Meincke, Shapiro, Duckworth, Mollick, Mollick, Cialdini — Call Me A Jerk (SSRN) — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5357179 (summary: https://gail.wharton.upenn.edu/research-and-insights/call-me-a-jerk-persuading-ai/)
[R25] Liu et al. 2024, Mind Your Step (CoT can hurt) — https://arxiv.org/abs/2410.21333
[R26] Dhuliawala et al. 2023, Chain-of-Verification (ACL Findings 2024) — https://arxiv.org/abs/2309.11495
[R27] Madaan et al. 2023, Self-Refine — https://arxiv.org/abs/2303.17651
[R28] Adversarial review — https://blog.fsck.com/2026/05/01/adversarial-review/
[R29] Shinn et al. 2023, Reflexion — https://arxiv.org/abs/2303.11366
Surveys/benchmarks: Prompt Report https://arxiv.org/abs/2406.06608 · APO survey (EMNLP 2025) https://arxiv.org/abs/2502.16923 · PromptBench https://arxiv.org/abs/2306.04528 · promptingguide.ai/papers
