# TypeScript Migration Plan for XaoS Fractal Viewer

## Summary
Migrate the current global-script fractal viewer (`index.html` + `js/xaos.js`) to a strict TypeScript, framework-agnostic core with a Vite-based app setup, while keeping delivery focused on a local app (not npm package yet).

React work starts after the TS core is stable, with a headless hook + canvas ref API first.

Legacy Bootstrap/jQuery UI will be frozen (no active migration effort), with a new TS demo app becoming the main surface.

## Decisions Locked
- Migration style: incremental TypeScript.
- Architecture: framework-agnostic core engine + thin UI adapter.
- Tooling: Vite + TypeScript.
- TS config: strict by default.
- Browser baseline: modern evergreen browsers.
- Distribution target: local app only.
- React timing: after TS core stabilization.
- React API direction: headless hook + canvas ref.
- Quality gates: tests + performance baseline.
- Legacy UI: freeze, do not evolve during migration.

## Target Architecture
1. Core Engine (TypeScript, no framework dependency)
- Owns fractal state, viewport math, frame progression, and pixel buffer generation.
- No direct DOM/global usage.

2. Canvas Runtime Adapter (TypeScript, DOM-aware)
- Connects core engine to `HTMLCanvasElement`, input events, and animation loop.
- Replaces direct inline/global handlers.

3. Demo App (Vite)
- Primary local app for manual QA and interaction.

4. React Integration Layer (later milestone)
- `useXaos` hook and optional low-level canvas component.

## Public APIs / Interfaces / Types
Create and stabilize these interfaces before React work:
- `FractalConfig`
- `ViewportRegion`
- `ZoomController`
- `PointerState`
- `FrameStats`

Details:
- `FractalConfig`: `symmetry`, `region`, `z0`, `maxiter`, `bailout`, `palette`, `formula`.
- `ViewportRegion`: `center`, `radius`, `angle`.
- `ZoomController`: `start()`, `stop()`, `resize(width,height)`, `setFractal(config)`, `getState()`, `dispose()`.
- `PointerState`: normalized button/touch state used by engine update step.
- `FrameStats`: `fps`, `frameTimeMs`, `incomplete`, optional calc counters.

React-oriented (later):
- `useXaos({ canvasRef, fractalConfig, autoplay, onStats })`.

## Phase Plan
### Phase 0: Baseline and Guardrails
- Add Vite + TypeScript scaffold without changing behavior.
- Keep existing JS running initially via compatibility entry path.
- Capture baseline metrics from current implementation:
- Startup render time.
- Sustained FPS during zoom.
- Visual snapshots of known coordinates.
- Add CI commands (build + tests).

### Phase 1: Type Foundations and Module Boundaries
- Introduce `tsconfig` (`strict: true`) and split code into modules:
- `core/` (math/state/render planning).
- `runtime/` (canvas/events/raf).
- `app/` (demo wiring).
- Add explicit types for existing data structures (`Price`, `Move`, `Line`, context objects).
- Replace global `xaos` mutation with explicit exports.
- Preserve runtime behavior exactly (no algorithm changes yet).

### Phase 2: Engine Extraction (Framework-Agnostic)
- Move fractal update/render logic into core services/functions:
- Frame step.
- Approximation/symmetry decisions.
- Palette/color output.
- Core accepts typed inputs and returns typed frame outputs/buffers.
- Runtime adapter owns:
- Canvas sizing.
- Event translation (mouse/touch).
- Animation loop orchestration.

### Phase 3: Input and Lifecycle Hardening
- Replace inline/on* handlers with managed listeners and deterministic teardown.
- Add resize handling and lifecycle-safe start/stop semantics.
- Ensure no hidden globals; enforce dependency injection for canvas/fractal config.

### Phase 4: Test + Perf Gates
- Unit tests for:
- Viewport conversion math.
- Palette generation.
- Coordinate/step calculations.
- Symmetry/approximation invariants (focused deterministic checks).
- Integration tests:
- Initialize + first frame.
- Zoom in/out interactions.
- Stop/dispose no-op safety.
- Perf checks:
- Compare against baseline; fail if major regression threshold exceeded (define threshold in repo docs, e.g. greater than 15-20 percent sustained FPS drop).

### Phase 5: React Preparation (Post-Core Stabilization)
- Add a React workspace/module in repo.
- Implement `useXaos` hook using `ZoomController`.
- Add minimal React demo screen consuming hook with external controls.
- Keep React layer thin; no duplicated engine logic.

## Testing Scenarios and Acceptance Criteria
1. Initial render draws fractal on first load in Vite demo.
2. Mouse interactions preserve current zoom/pan semantics.
3. Touch interactions preserve one-finger/two-finger behavior.
4. Stop/dispose releases listeners and animation loop.
5. Engine outputs remain deterministic for fixed config + seed conditions.
6. Strict TypeScript passes with no untracked `any` creep.
7. Performance stays within agreed regression budget.

## Risks and Mitigations
- Risk: behavior drift during extraction.
- Mitigation: baseline snapshots + incremental module moves + parity checks per phase.
- Risk: strict typing friction in algorithm-heavy sections.
- Mitigation: introduce narrow temporary adapter types with explicit TODO ownership.
- Risk: DOM/runtime coupling sneaks back into core.
- Mitigation: lint boundaries and code organization (`core` cannot import `runtime`/DOM).

## Assumptions and Defaults
- No npm package publishing in this migration cycle.
- Legacy Bootstrap/jQuery page is frozen and not a primary migration target.
- Modern evergreen browsers only.
- React work begins only after core TS API is stable and tested.
- Strict TypeScript remains enabled throughout migration; exceptions are temporary and tracked.
