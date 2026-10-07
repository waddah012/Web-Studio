# 001: Organize by feature with explicit browser boundaries

Status: accepted

## Context

The workspace and website editor originally shared a single event-binding module. Templates, normalization, and rendering shared another file. Adding editor controls or project workflows made those files harder to navigate and test.

## Decision

Group project management and website editing under `src/features/`. Keep their pure models separate from DOM controllers. Compose their shared store in `src/app.js`. Put browser persistence under `src/infrastructure/` and small DOM/download helpers under `src/shared/`.

Use existing browser APIs and Node tooling while the product consists of project management and a single-page template editor. Maintain working modules rather than empty directories for hypothetical backend services.

## Consequences

Features have clear homes and can be tested without mounting the full interface. Preview and export share a rendering path. The entry point shows how the application fits together.

The application still uses imperative DOM code. Complex block editing may justify a framework and a section registry. Browser persistence remains local and synchronous; collaborative editing requires a new persistence contract. Those changes should preserve the pure domain and rendering boundaries.

## Alternatives

A flat source directory is easier for a tiny demo but makes feature ownership ambiguous as the product grows. A multi-package monorepo would add release and dependency management without independently deployable packages. A framework migration now would introduce toolchain changes before the current interaction complexity requires them.
