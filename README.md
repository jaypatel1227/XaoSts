# XaoS TypeScript

XaoS TypeScript is a monorepo for a fractal core library and a browser demo app.

## Workspace Layout

- `packages/core`: fractal math, palette logic, and shared core types
- `apps/web`: demo app (Vite + Canvas runtime) consuming `@xaosts/core`

## Run (Bun + Turborepo)

- Install dependencies: `bun install`
- Start web demo: `bun run dev`
- Open app: `http://localhost:5173/`
- Typecheck all packages: `bun run typecheck`
- Run tests across workspaces: `bun run test`
- Run browser smoke tests only: `bun run test:smoke`
- Build all workspaces: `bun run build`

Useful filtered commands:

- Web only build: `bun run build:web`
- Core only tests: `bun run test:core`

## License

GPL-3.0-or-later. See <http://www.gnu.org/licenses/>.
