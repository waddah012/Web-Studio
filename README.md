# Web Studio

A website project workspace with a live landing-page editor. Manage projects, customize agency/portfolio/product templates, preview desktop and mobile layouts, and export standalone HTML.

## Start developing

Use Node.js 24, or Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Refresh the browser after editing source files. No runtime dependencies or external accounts are required. Development dependencies provide browser and accessibility testing. `PORT` changes the port; `HOST` changes the listening address.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Serve source locally |
| `npm test` | Run behavior and architecture tests |
| `npm run build` | Assemble the static site in `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run check` | Check all JavaScript, run tests, and build |

## Code skeleton

```text
src/app.js                   Compose the application
src/features/projects/       Project model, store, cards, workspace controller
src/features/editor/         Website model, templates, renderer, editor controller
src/infrastructure/          Browser persistence and saved-data recovery
src/shared/                  DOM, download, and notification helpers
public/                      Public assets
scripts/                     Local server, build, and checks
tests/                       Regression and module-boundary checks
docs/                        Architecture, references, and decisions
.github/workflows/           Continuous integration
```

Read [Architecture](docs/ARCHITECTURE.md) for each module's responsibility, why it exists, data flow, and where new features belong. [Repository references](docs/REFERENCES.md) connects the structure to GrapesJS, Craft.js, and Puck. [Decision 001](docs/decisions/001-modular-browser-application.md) explains the feature organization and toolchain tradeoffs. [Contributing](CONTRIBUTING.md) describes the development workflow.

## Use the workspace

Create a project, search by name/description/type, filter by status, and sort by name or recently added. **Edit project** updates its details or deletes it. **Mark ready** and **Reopen** change its status.

Choose **Open website editor** on a project. Select a starting template and customize text, email, and colors. The preview updates as you type. **Save website** stores the content in your workspace; **Export HTML** downloads a self-contained `index.html` with embedded styles.

## Save and recover work

Projects and saved websites persist in this browser's local storage. **Export backup** downloads a versioned JSON workspace. **Import backup** validates the file and asks before replacing the current workspace. The import limit is 50 MB and 1,000 projects. Keep a backup before importing or deleting; browser storage is not a cloud backup.

The three initial projects are examples. To restore them, remove `web-studio-projects` from local storage through browser developer tools and reload. If storage is unavailable, changes remain in the session and the interface asks you to export a backup.

## Publish

Run `npm run build` and publish the contents of `dist/` to a static host, preserving `src/` and `public/`. Exported websites can be hosted independently by uploading their downloaded `index.html`. The included HTTP server is for local development and preview.

## Current scope

The builder edits one page with up to 20 configurable text, services, image, and contact sections. Accounts, collaborative editing, drag-and-drop blocks, multiple pages, and integrated hosting are future work. Typography uses Google Fonts when available with system-font fallbacks. The interface includes semantic markup, native dialogs, and visible keyboard focus; visual and accessibility checks should accompany interface changes.

## Page editing and recovery

Customize the brand, navigation contact label, hero, and footer. In **Page sections**, add a section, edit its content, move it up/down, or remove it. Service entries use one line per item: `title | description`. Navigation links follow the section titles and order. Images accept HTTPS URLs or embedded PNG/JPEG/WebP uploads smaller than 1 MB; provide an image description for screen readers. Uploaded images travel with saved workspaces and exported HTML.

**Undo** and **Redo** cover page edits, template replacement, and section changes. Consecutive typing is grouped into one edit. The latest 50 changes are available while the editor is open. Closing or reloading ends the history session.

Unsaved edits are stored separately as a recovery draft in this browser. Reopening a project recovers its draft. **Save website** updates the saved page; **Discard draft** returns to that page. Closing a dirty editor asks before leaving, and the browser warns on reload/tab close. Recovery depends on available browser storage; export a backup or HTML before clearing browser data. Large embedded images can exhaust storage, in which case the interface reports that the save or draft could not persist.

## Browser verification

```sh
npx playwright install chromium
npm run test:browser
```

The suite builds the site and starts an isolated server on port 5189. It checks desktop and mobile editing, reordering, undo/redo, save/reload, draft recovery, image uploads, standalone exports, keyboard interaction, and automated accessibility rules. GitHub Actions runs the same suite. Automated accessibility checks complement manual review; they do not establish full conformance.
