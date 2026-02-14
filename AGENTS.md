# AGENTS.md

This file defines the operating contract for coding agents in this repository.
It is strict by design to keep changes safe, fast to review, and easy to maintain.

## 1) Project Identity

- Name: `xaosts`
- Domain: browser fractal renderer and zoom runtime
- Current stack: TypeScript, Vite, Vitest, Bun
- Rendering path: Canvas 2D with typed-array pixel writes

## 2) Hard Requirements

- Use `bun` for package management and script execution.
- When doing anything where decisions need to be made and not directed to pick a certain option, interview the user and make sure you are capturing their intentions.
- Do not introduce npm/yarn/pnpm lockfiles or command examples.
- Keep strict TypeScript guarantees; do not weaken `tsconfig` strictness to pass builds.
- Keep changes minimal and task-focused; do not mix unrelated refactors.
- Avoid new dependencies unless they are clearly necessary.

## 3) Finalized Technical Decisions

These are not pending. They are the active project policy.

1. Browser support: evergreen browsers only.
2. Formatter/linter: Biome.
3. CI required gates: `typecheck` and `test` (build is not a required gate).
4. Test strategy: unit tests plus browser E2E smoke tests.
5. Performance target: best effort, no hard FPS SLA yet.
6. Release strategy: manual tags/changelog.
7. Dependency policy: minimal dependencies.
8. Product focus: Mandelbrot quality and performance first.
9. Compiler direction: use stable TypeScript compiler workflows (`tsc`) as default.
10. Repo topology direction: adopt Turborepo monorepo with a shared component library.

## 4) Toolchain Policy

### Bun

- Install: `bun install`
- Run scripts with `bun run <script>`
- Prefer Bun-native workflows over Node-specific alternatives

### TypeScript

- Use stable `tsc` workflows for typechecking and build validation.
- Do not introduce experimental compiler paths unless explicitly requested.
- Do not weaken type safety or strictness to work around tooling issues.

### Build/Test

- Bundler/dev server: Vite
- Unit tests: Vitest
- Browser smoke tests: Playwright (lightweight critical-path checks)

## 5) Monorepo and Turborepo Policy

Turborepo is the accepted direction for this project because we plan to maintain both the app and a shared component library.

- Monorepo orchestrator: Turborepo
- Preferred layout:
  - `apps/web` for the fractal app
  - `packages/ui` for shared UI components
  - `packages/*` for reusable internal libraries
- Keep package boundaries clean:
  - UI package must not depend on app internals
  - shared packages should expose explicit public APIs
- Cacheable tasks should be declared in `turbo.json` with clear inputs/outputs

Migration rule:

- Until migration is complete, keep existing root workflows working.
- Do not break current developer commands while introducing monorepo structure.

## 6) Repository Map (Current)

- App entrypoint: `apps/web/src/main.ts`
- App runtime/controller: `apps/web/src/runtime/`
- App shell: `apps/web/index.html`
- App styles: `apps/web/src/style.css`
- Core library: `packages/core/src/`
- Unit tests: `packages/core/test/`
- Browser smoke tests: `apps/web/e2e/`

Placement rules:

- Put pure fractal/math logic in `packages/core/src/` or a future shared package.
- Put DOM/canvas/event orchestration in `apps/web/src/runtime/` or app layer code.
- Keep startup files thin and compositional.

## 7) Coding Standards

- Language: TypeScript (strict), ES modules.
- Prefer explicit types on exported APIs and complex state.
- Keep pure logic pure and isolate side effects.
- Avoid magic numbers in performance-sensitive paths.
- Validate nullable/undefined values explicitly.
- Throw clear errors for impossible states.
- Add comments only for non-obvious math, transforms, or performance rationale.

## 8) Rendering and Fractal Guardrails

- Preserve deterministic palette generation.
- Preserve default Mandelbrot behavior unless explicitly changing product behavior:
  - center `(-0.75, 0)`
  - radius `(2.5, 2.5)`
  - `maxiter = 512`
  - `bailout = 4`
- Prefer typed arrays and `ImageData` for pixel operations.
- In animation/render loops, avoid avoidable allocations and heavy logging.
- Keep mouse/touch zoom semantics stable unless interaction redesign is requested.

## 9) Testing and Validation

For behavioral changes:

1. Add/update unit tests.
2. Add/update Playwright smoke coverage for affected critical path when relevant.
3. Run required checks:
   - `bun run typecheck`
   - `bun run test`

Build validation:

- `bun run build` is strongly recommended before merge, but not a required CI gate.

If any validation step is skipped or fails, report it explicitly.

## 10) UX and Accessibility Constraints

- Keep UI functional on desktop and mobile.
- Use semantic HTML for controls/content where practical.
- Ensure keyboard-accessible controls for interactive UI.
- Maintain readable contrast for newly introduced UI.
- Keep visual language consistent unless redesign is requested.

## 11) Change and Review Hygiene

- Keep commits small and focused.
- Include only task-relevant files.
- Summaries should state:
  - what changed
  - why
  - how it was validated

Review priority order:

1. Correctness and regressions
2. Performance risks
3. Missing or weak tests
4. Maintainability concerns

## 12) Dependency and Package Rules

- Default stance: do not add a dependency if native platform/tooling can solve the problem.
- Prefer internal packages in the monorepo over one-off external utilities.
- For any new dependency, capture:
  - why it is needed
  - why existing options are insufficient
  - expected maintenance impact

## 13) Operating Principle

When tradeoffs conflict, optimize for long-term correctness and maintainability while keeping iteration speed high through Bun and Turborepo automation.
