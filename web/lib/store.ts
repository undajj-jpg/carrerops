import type { Candidate, RoleConfig } from "./types";

const roles: Map<string, RoleConfig> = new Map();
const candidates: Map<string, Candidate> = new Map();

export function getRoles(): RoleConfig[] {
  return Array.from(roles.values()).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );
}

export function getRole(id: string): RoleConfig | undefined {
  return roles.get(id);
}

export function addRole(role: RoleConfig): void {
  roles.set(role.id, role);
}

export function updateRole(id: string, updates: Partial<RoleConfig>): RoleConfig | null {
  const existing = roles.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  roles.set(id, updated);
  return updated;
}

export function deleteRole(id: string): boolean {
  for (const [cid, c] of candidates) {
    if (c.roleId === id) candidates.delete(cid);
  }
  return roles.delete(id);
}

export function getCandidates(roleId?: string): Candidate[] {
  const all = Array.from(candidates.values());
  const filtered = roleId ? all.filter((c) => c.roleId === roleId) : all;
  return filtered.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
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

export function getStats(roleId?: string) {
  const all = getCandidates(roleId);
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
