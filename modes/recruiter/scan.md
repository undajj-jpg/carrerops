# Mode: recruiter-scan — Bulk CV Processing

Process a batch of CVs against the current open role.

## Trigger

- "Scan CVs in [directory]"
- "Process new candidates"
- "Evaluate all CVs in data/candidates/"

## Pipeline

### Step 1 — Load role

Read `config/role.yml` for the JD and requirements. If missing, ask the recruiter to paste the JD or run `cp config/role.example.yml config/role.yml`.

### Step 2 — Discover candidates

List all `.md` files in `data/candidates/` that don't yet have a report in `reports/candidates/`.

### Step 3 — Evaluate each

For each new candidate CV:
1. Run the full A-F evaluation from `modes/recruiter/evaluate.md`
2. Save report to `reports/candidates/`
3. Write tracker TSV to `batch/candidate-additions/`

### Step 4 — Rank and summarize

After all evaluations:
1. Run `node rank-candidates.mjs --format table`
2. Present the ranked list to the recruiter
3. Highlight any Strong Yes candidates for immediate action

### Step 5 — Suggest next steps

Based on the results:
- If Strong Yes candidates exist → "These N candidates are strong fits. Want to shortlist them?"
- If pipeline is thin → "Only N candidates scored above 3.5. Consider broadening the search."
- If many auto-rejects → "X candidates failed hard filters. Review if filters are too strict?"
