---
name: merge-conflict-resolution
description: Resolve git merge/rebase conflicts safely in the EduReels monorepo. Use whenever `git status` shows unmerged paths, a rebase/merge halts, or the user mentions conflicts. Also use PROACTIVELY before starting work: rebase onto latest main first.
---

# Merge Conflict Resolution

## Prime directive
A conflict is a MERGE OF INTENT, not a text puzzle. Never resolve by picking a side
mechanically. First reconstruct what each branch was trying to do, then produce code
that satisfies BOTH intents — or escalate.

## Procedure
1. **Situate**: `git status`, `git log --oneline main..HEAD`, `git log --oneline HEAD..main`.
   Identify the conflicting commits on each side and read their commit messages.
2. **Classify each conflicted file**:
   - **Ownership violation** (file outside this branch's owned paths per AGENTS.md):
     STOP. Take `main`'s version (`git checkout --theirs` during rebase), report the
     violation — someone edited outside their module.
   - **Lockfiles** (`package-lock.json`): never hand-merge. Take main's version, then
     re-run `npm install` to regenerate: `git checkout main -- package-lock.json && npm i`.
   - **Generated files** (Remotion out/, fixtures manifests): regenerate, don't merge.
   - **Shared contract files** (`/specs/*.md`, `src/api/` types, scene schema, DB
     migrations): HIGH RISK. See §Contract conflicts.
   - **Ordinary source**: proceed to step 3.
3. **Resolve ordinary source**: read both full versions (not just the hunk). Merge
   intent. If both sides added items to the same list/enum/route table, keep BOTH
   in a deterministic order. If both modified the same function differently,
   reconstruct the union behavior; if behaviors are mutually exclusive, escalate.
4. **Verify — resolution isn't done until proven**:
   - `tsc --noEmit` (frontend) and/or `cd backend && npm run build`
   - Run the touched module's tests
   - Grep for leftover markers: `git grep -nE '<<<<<<<|>>>>>>>|======='` (must be empty)
5. **Continue**: `git rebase --continue` (or commit the merge). Commit message:
   `merge: resolve <files> — kept <intent A> + <intent B>`.

## Contract conflicts (specs, DTOs, migrations, scene schema)
These files are frozen by AGENTS.md Stage 1. A conflict here means two people changed
the contract independently — resolving silently WILL break a third teammate.
- Do NOT auto-resolve. Produce a 5-line summary of both versions' differences and
  ask the human to pick or reconcile.
- Migrations: never merge two migrations into one file. Keep both, renumber the later
  one to sort after, verify it applies on top of the other.

## Escalate (stop and ask a human) when
- Both sides changed the same business logic with incompatible behavior
- Conflict involves auth, credit/budget guards, or the VideoTimeline schema
- Resolution would require editing files outside the branch's ownership
- Two resolution attempts have failed verification

## Anti-patterns (never do)
- `git checkout --ours/--theirs` on ordinary source just to make the conflict go away
- Deleting a teammate's added code because "it wasn't in my branch"
- Resolving without running the build
- Force-pushing over a shared branch (`main` is protected; feature branches:
  `--force-with-lease` only, never `--force`)
