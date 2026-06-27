import type { Candidate, RoleConfig } from "./types";

const candidates: Map<string, Candidate> = new Map();
let roleConfig: RoleConfig | null = null;

export function getCandidates(): Candidate[] {
  return Array.from(candidates.values()).sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1)
  );
}

export function getCandidate(id: string): Candidate | undefined {
  return candidates.get(id);
}

export function addCandidate(c: Candidate): void {
  candidates.set(c.id, c);
}

export function updateCandidate(
  id: string,
  updates: Partial<Candidate>
): Candidate | null {
  const existing = candidates.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  candidates.set(id, updated);
  return updated;
}

export function deleteCandidate(id: string): boolean {
  return candidates.delete(id);
}

export function getRole(): RoleConfig | null {
  return roleConfig;
}

export function setRole(config: RoleConfig): void {
  roleConfig = config;
}

export function getStats() {
  const all = getCandidates();
  const evaluated = all.filter((c) => c.score !== null);
  return {
    total: all.length,
    evaluated: evaluated.length,
    pending: all.length - evaluated.length,
    strongYes: evaluated.filter((c) => (c.score ?? 0) >= 4.5).length,
    yes: evaluated.filter(
      (c) => (c.score ?? 0) >= 4.0 && (c.score ?? 0) < 4.5
    ).length,
    maybe: evaluated.filter(
      (c) => (c.score ?? 0) >= 3.5 && (c.score ?? 0) < 4.0
    ).length,
    no: evaluated.filter((c) => (c.score ?? 0) < 3.5 && c.score !== null)
      .length,
    avgScore:
      evaluated.length > 0
        ? evaluated.reduce((sum, c) => sum + (c.score ?? 0), 0) /
          evaluated.length
        : 0,
  };
}
