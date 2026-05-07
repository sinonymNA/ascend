# Ascend Foundation Plan (Step 1 Complete)

## Completed
- Added a production-ready Supabase PostgreSQL schema in `supabase/schema.sql` with:
  - Core entities (users, exams, zones, levels, journeys).
  - Assessment/progress entities (questions, responses, boss attempts, progress).
  - Think Aloud tracking.
  - Economy + cosmetics models.
  - Constraints, unique keys, and performance indexes.

## Product Refinements
- **Tagline pick:** “Study less. Think better. Score higher.”
- Keep “Think Aloud” optional and reward usage with non-score prestige (title unlocks).
- Add `updated_at` to mutable profile rows for sync/conflict handling.

## Recommended Launch Content Density
- AP World launch target:
  - 5 zones × 5 levels × **30 seed questions/level** = 750 level questions.
  - Boss pools: **40 mixed questions/zone** (can overlap by up to 30%).
  - Diagnostic pool: **120 tagged questions** (24 per zone; difficulty balanced 1-5).
- Why: enough entropy to avoid repeats for first 4-6 weeks at 20-30 min/day.

## Claude Variation Strategy
- Store each question with metadata:
  - `exam`, `zone`, `skill_tag`, `difficulty`, `era/content tags`, `misconception_tag`.
- Use a 2-stage generation pipeline:
  1. **Variation Draft Prompt** (Claude): keep skill+answer invariant, alter context/stem/distractors.
  2. **Verifier Prompt** (Claude): JSON rubric checks
     - same skill?
     - one unambiguously correct answer?
     - distractors map to common misconceptions?
- Accept only variants scoring >= 0.85 verifier confidence.

## Map Generation Weights (Diagnostic)
For each zone z:
- `accuracy_z` = correct/attempted (0-1)
- `confidence_z` from response latency + answer changes (0-1)
- `difficulty_z` weighted correctness by difficulty (0-1)

Composite mastery:

`mastery_z = 0.55*accuracy_z + 0.30*difficulty_z + 0.15*confidence_z`

Ordering:
- Zones sorted descending mastery for unlock order.
- Lowest mastery forced to final unlock slot (“Final Challenge”).

Initial level difficulty:
- mastery >= 0.80 → start at difficulty band 3
- 0.60-0.79 → band 2
- < 0.60 → band 1

## Spaced Repetition Model
Use SM-2 inspired adaptation per question-user pair (`review_queue`):
- On incorrect:
  - `interval_days = 1`
  - `ease_factor = max(1.3, ease_factor - 0.2)`
- On correct with quality q (0-5):
  - if first success: interval=1
  - second success: interval=3
  - else interval=round(interval * ease_factor)
  - `ease_factor = max(1.3, ease_factor + (0.1 - (5-q)*(0.08 + (5-q)*0.02)))`
- Schedule `next_review_at = now() + interval_days`

Queue policy:
- Inject max 20-25% review questions into any level session.
- Hard cap same-question resurfacing to once per 24h unless in boss remediation mode.
