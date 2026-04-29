# Contributing to DOMAN

Thank you for your interest in contributing to DOMAN! 🎉

We welcome contributions of all kinds — bug fixes, features, documentation improvements, and more.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Areas That Need Help](#areas-that-need-help)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<username>/doman.git
   cd doman
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/artomily/doman.git
   ```

---

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, RPC URLs, etc.

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Branch Naming

| Type          | Format                 | Example                     |
| ------------- | ---------------------- | --------------------------- |
| Feature       | `feat/description`     | `feat/add-rate-limiting`    |
| Bug Fix       | `fix/description`      | `fix/scan-timeout-error`    |
| Documentation | `docs/description`     | `docs/update-api-reference` |
| Refactor      | `refactor/description` | `refactor/scanner-service`  |
| Chore         | `chore/description`    | `chore/update-dependencies` |

```bash
git checkout -b feat/my-feature
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scopes:** `scanner`, `report`, `api`, `ui`, `db`, `auth`, `sync`, `config`

**Examples:**
```bash
feat(scanner): add proxy pattern detection for ERC1967
fix(api): handle timeout on large contract bytecode
docs(api): update scan endpoint response format
```

---

## Pull Request Process

1. Ensure `npm run lint` passes without errors
2. Ensure `npm run build` succeeds
3. Update documentation if your changes affect API behavior
4. Write a clear PR description — what changed and why
5. Link related issues (e.g., `Closes #12`)
6. Keep PRs focused — one feature or fix per PR

---

## Code Style

- **TypeScript strict mode** — avoid `any` without justification
- **Prettier + ESLint** — run `npm run lint` before committing
- **React Server Components** — default for all pages; use `'use client'` only when needed
- **Service pattern** — business logic goes in `services/`, not in route handlers
- **Zod validation** — validate all external inputs with Zod
- **Error handling** — use `AppError` from `lib/error-handler.ts`

---

## Areas That Need Help

| Area              | Priority | Description                            |
| ----------------- | -------- | -------------------------------------- |
| Test Suite        | 🔴 HIGH  | Unit tests for services and API routes |
| Rate Limiting     | 🔴 HIGH  | Upstash Redis middleware               |
| More Chain Support| 🟡 MED   | Extend beyond Base chain               |
| UI Improvements   | 🟡 MED   | Accessibility and mobile UX            |
| Documentation     | 🟢 LOW   | Improve inline code comments           |

---

## Questions?

Open an issue or start a discussion on GitHub. We're happy to help!
