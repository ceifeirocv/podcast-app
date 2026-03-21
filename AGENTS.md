# Agent Configuration

<!-- BEGIN:research-rules -->

## Research & Documentation

- **Always save research** (API findings, library behavior, architecture decisions, etc.) to the `doc/research` folder before writing code that depends on it.
- **Always check `doc/` first** before researching a topic — a relevant document may already exist. If it does, use it as the primary source of truth and update it if new findings contradict or extend it.
- **When researching a topic, check if the source recommends any skills** — if it does, surface and use those recommended skills as part of the research.
- Use clear, descriptive filenames (e.g., `doc/nextjs-routing.md`, `doc/auth-flow.md`).

<!-- END:research-rules -->

<!-- BEGIN:planning-rules -->

## Planning

- **Always check `doc/` before planning** any task or feature — existing research must inform the plan before any code or design decisions are made.
- **Always check available skills and agents before planning** — review both the skills list and any available agents, then explicitly reference which skills and agents should be used for each individual task in the plan.

<!-- END:planning-rules -->

<!-- BEGIN:fleet-rules -->

## Fleet

- **Always create a new branch** before running or applying a Fleet task — never run Fleet against `main` or the current working branch directly.
- Use a descriptive branch name tied to the task (e.g., `fleet/update-deps`, `fleet/refactor-auth`).

<!-- END:fleet-rules -->

<!-- BEGIN:git-rules -->

## Git Hygiene

- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Squash noisy/WIP commits before merging into main.
- Start new branches from the latest `main` to avoid merge conflicts.
- Never commit directly to `main` — always use a branch and PR/MR.
- **Never work directly on `main` or `development`** — always create a new branch for any code changes, even minor ones.
- If a change is unrelated to the current branch, create a separate branch for it before making any edits.
- Do not co-author commits with the agent.
- Do not mention the agent in commit messages or PR descriptions.

<!-- END:git-rules -->

<!-- BEGIN:security-rules -->

## Security

- **Never hardcode secrets, tokens, or credentials** — always use environment variables.
- **Never commit `.env` files** — ensure `.env` is in `.gitignore`.
- If a secret is accidentally exposed, treat it as compromised and rotate it immediately.

<!-- END:security-rules -->

<!-- BEGIN:task-discipline-rules -->

## Task Discipline

- Never leave `TODO` or `FIXME` comments in code without a linked issue or ticket.
- Always update the relevant `doc/` file if code changes contradict or extend existing research.
- Run the project linter/formatter before marking any task as done.

<!-- END:task-discipline-rules -->

<!-- BEGIN:docs-update-rules -->

## Documentation Updates

- **Always update the root `README.md`** when changes affect setup, usage, configuration, or any publicly visible behaviour.
- **Always update the relevant feature doc** in `doc/` when a feature is added, changed, or removed — keep it in sync with the code.
- Do both before marking a task as done.

<!-- END:docs-update-rules -->

<!-- BEGIN:testing-rules -->

## Testing

- **Always ask** before writing tests — confirm whether tests are needed, what kind (unit, integration, e2e), and where they should live.
- Never assume a testing framework — ask if it's not already documented in `doc/`.

<!-- END:testing-rules -->
