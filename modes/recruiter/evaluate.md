# Mode: recruiter-evaluate — CV-to-JD Fit Evaluation (Recruiter Side)

When the recruiter provides a JD and a CV (or batch of CVs), evaluate each candidate against the role using blocks A-F.

## Sources of Truth

| File | Purpose |
|------|---------|
| The JD (pasted or from `jds/`) | Role requirements — the fixed target |
| The CV (PDF-parsed or markdown) | Candidate being evaluated |
| `config/role.yml` | Role config: must-haves, nice-to-haves, team context, comp band |
| `modes/recruiter/_shared.md` | Shared scoring system and rules |

---

## Step 0 — Role Context

If `config/role.yml` exists, load it. It contains:
- Must-have requirements (hard filters)
- Nice-to-have requirements (soft scoring)
- Team context (size, stage, culture)
- Comp band (min/max/target)
- Location requirements
- Seniority target

If no `config/role.yml`, extract requirements directly from the JD.

---

## Block A — Candidate Snapshot

Table with:
- **Name** (from CV header)
- **Current role** and company
- **Years of experience** (total + relevant)
- **Location** and remote compatibility
- **Education** (highest relevant)
- **Archetype detected** (what kind of professional they are)
- **TL;DR** — 1-sentence fit summary

---

## Block B — Requirements Match

Create a table mapping each JD requirement to evidence in the CV.

| # | Requirement | Evidence from CV | Strength | Notes |
|---|-------------|-----------------|----------|-------|
| 1 | Must-have: X | Exact CV line | Strong/Partial/Missing | ... |

**Scoring per requirement:**
- **Strong** — Direct, demonstrated experience with metrics
- **Partial** — Adjacent experience, transferable skills
- **Missing** — No evidence found

**Must-have coverage**: Count how many must-haves are Strong or Partial. If any must-have is Missing, flag it as a potential disqualifier.

---

## Block C — Experience Depth Analysis

For each relevant role in the CV:
1. **Relevance to this JD** (High/Medium/Low)
2. **Impact signals** — metrics, scope, scale
3. **Progression signals** — promotions, growing scope, increasing complexity
4. **Red flags** — short tenures without explanation, gaps, title inflation

**Seniority assessment:**
- Detected level from CV vs required level from JD
- Over/under-qualified risk assessment
- If overqualified: retention risk, comp expectations
- If underqualified: growth trajectory, learning signals

---

## Block D — Skills & Technical Fit

| Category | Required | Candidate Has | Gap |
|----------|----------|---------------|-----|
| Core tech | ... | ... | ... |
| Domain knowledge | ... | ... | ... |
| Soft skills | ... | ... | ... |
| Certifications | ... | ... | ... |

**Keyword overlap**: Count exact keyword matches between JD and CV. Report coverage percentage.

---

## Block E — Culture & Team Fit Signals

Based on CV signals (not assumptions):
- **Work style indicators** — startup vs enterprise experience, team sizes led, remote experience
- **Communication signals** — writing quality, clarity, conciseness
- **Growth mindset** — continuous learning, side projects, certifications
- **Leadership signals** — people management, cross-functional work, mentoring

**Caveat:** Culture fit from a CV is limited. Flag where an interview would clarify.

---

## Block F — Hiring Recommendation

**Overall score: X/5**

| Dimension | Score | Weight | Notes |
|-----------|-------|--------|-------|
| Requirements match | X/5 | 35% | Must-haves met? |
| Experience depth | X/5 | 25% | Relevant experience quality |
| Technical fit | X/5 | 20% | Skills alignment |
| Seniority fit | X/5 | 10% | Level match |
| Culture signals | X/5 | 10% | Team compatibility |

**Recommendation:** One of:
- **Strong Yes** (4.5+) — Advance to interview immediately
- **Yes** (4.0-4.4) — Good candidate, worth interviewing
- **Maybe** (3.5-3.9) — Some gaps, interview if pipeline is thin
- **No** (3.0-3.4) — Significant gaps, likely not a fit
- **Strong No** (<3.0) — Does not meet minimum requirements

**Key strengths** (top 3):
1. ...

**Key concerns** (top 3):
1. ...

**Interview focus areas** — What to probe in the interview:
1. ...

**Suggested interview questions** (3-5 tailored to this candidate's profile):
1. ...

---

## Machine Summary

```yaml
candidate_name: "{name}"
current_role: "{role}"
score: {X.X}
recommendation: "{Strong Yes | Yes | Maybe | No | Strong No}"
must_haves_met: {X}/{total}
must_haves_missing:
  - "{gap}"
top_strengths:
  - "{strength}"
key_concerns:
  - "{concern}"
interview_priority: "{High | Medium | Low | Skip}"
```

---

## Post-evaluation

### 1. Save report

Save to `reports/candidates/{###}-{candidate-slug}-{YYYY-MM-DD}.md`:

```markdown
# Candidate Evaluation: {Name} — {Role}

**Date:** {YYYY-MM-DD}
**Score:** {X/5}
**Recommendation:** {tier}
**Must-haves:** {X}/{total} met

---

(Full blocks A-F content)

---

## Machine Summary
(YAML block)
```

### 2. Record in tracker

Write TSV to `batch/candidate-additions/{num}-{candidate-slug}.tsv`:

```
{num}\t{date}\t{candidate-name}\t{current-role}\t{score}/5\t{recommendation}\t{must-haves-met}/{total}\t[{num}](reports/candidates/{num}-{slug}-{date}.md)\t{1-line-note}
```

### 3. Update ranking

After evaluating, re-sort `data/candidates.md` by score (descending). The recruiter should see the best candidates at the top.
