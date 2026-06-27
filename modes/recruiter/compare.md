# Mode: recruiter-compare — Side-by-Side Candidate Comparison

When the recruiter wants to compare 2-5 candidates for the same role.

## Input

Either:
- "Compare candidates X, Y, Z" (names from tracker)
- "Compare top 5" (auto-select from ranked list)

## Output

### 1. Comparison Matrix

| Dimension | {Candidate A} | {Candidate B} | {Candidate C} |
|-----------|--------------|--------------|--------------|
| Overall Score | X/5 | X/5 | X/5 |
| Must-haves met | X/Y | X/Y | X/Y |
| Years relevant exp | N | N | N |
| Seniority fit | Over/Match/Under | ... | ... |
| Strongest skill | ... | ... | ... |
| Biggest gap | ... | ... | ... |
| Culture signals | ... | ... | ... |
| Comp expectations | ... | ... | ... |
| Interview priority | High/Med/Low | ... | ... |

### 2. Stack Rank

Ordered list with 1-sentence justification for each position.

### 3. Diversity of Perspectives

Note what each candidate brings that the others don't — different backgrounds, approaches, or experiences that could enrich the team.

### 4. Recommended Interview Slate

Suggest which candidates to interview and in what order, with rationale.

### 5. Interview Plan

For each recommended candidate, suggest:
- Which interviewer profile should assess them (technical, cultural, domain)
- 2-3 specific questions tailored to their profile
- What to probe based on their gaps
