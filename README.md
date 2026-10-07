# Web Studio

A focused starting point for building websites and web applications. Includes a responsive workspace, reusable project cards, searchable project lists, status filters, and a keyboard-accessible project creation dialog.

## Getting started

Install Node.js 22 or newer. No third-party packages are required.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Edit the source and refresh your browser to see changes. Set `PORT` to use another port, or `HOST` to change the listening address.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Serve the source locally |
| `npm test` | Run project filtering and persistence tests |
| `npm run build` | Create a deployable static site in `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run check` | Check JavaScript syntax, run tests, and build |

## Project structure

```text
index.html             Accessible page structure and creation dialog
src/app.js             Workspace state and browser interactions
src/components.js      Reusable project card renderer
src/projects.js        Starter data, filtering, and storage validation
src/styles.css         Design tokens, layouts, and responsive styles
public/favicon.svg     Web Studio identity
scripts/server.mjs     Local development and preview server
scripts/build.mjs      Static production build
tests/                 Native Node.js test suite
```

## Using the workspace

Choose **New project** or **Start building**, enter a name and description, and choose a project type. Search matches names, descriptions, and types. Filter projects by status, then use **Mark ready** or **Reopen** to update a project.

Projects are saved in your browser's local storage. The three initial projects are examples. This starter tracks project ideas; it does not generate source files or provision repositories. There is no backend or account system. To restore the examples, remove the `web-studio-projects` local storage entry using browser developer tools and refresh.

## Extending the starter

Use `projectCard(project, onToggle)` for consistent cards. Keep pure data logic in `projects.js` and UI orchestration in `app.js`. Add new shared interface components to `components.js`, or split them into a `src/components/` directory as the project grows. Colors and typography live in `styles.css`.

The interface uses semantic HTML, native form validation and dialogs, visible keyboard focus, and responsive layouts. Google Fonts enhances the typography when internet access is available; system fonts provide a fallback.

## Deployment

Run `npm run build`, then publish the contents of `dist/` to a static web host. No server runtime is needed in production. Keep the `src/` and `public/` paths intact. The included server is intended for local development and preview.

## Project management and backups

Use **Edit project** to update a name, description, or type, or delete a project. Sort by name or recently added. **Export backup** downloads your full workspace as JSON. **Import backup** validates the file before asking to replace the current workspace. Backups are limited to 2 MB and 1,000 projects. Keep a backup before importing or deleting.

## Architecture and quality

`src/store.js` owns project mutations, validation, persistence, and subscriptions. Callers receive independent snapshots, so interface code cannot mutate the store accidentally. `projects.js` contains pure queries and saved-record validation; `components.js` renders user content through text nodes. `app.js` binds browser events to these layers. Storage failures keep session data available and prompt you to export it.

GitHub Actions runs the syntax checks, unit tests, and static build on pushes and pull requests. Tests cover project lifecycle, invalid mutations, duplicate imports, backup round trips, storage failure recovery, and filtering. Run `npm run check` before committing.

## Website builder

Choose **Open website editor** on a project. Start from an agency, portfolio, or product template, then edit the headline, tagline, description, contact button, email, and colors. The sandboxed live preview supports desktop and mobile widths. **Save website** persists the page in your workspace; **Export HTML** downloads a standalone `index.html` with embedded styles, ready for static hosting. Workspace backups include saved website content.

The builder currently produces a single landing page with a fixed three-section layout. It does not provide drag-and-drop blocks, multiple pages, hosting, or collaborative editing. Website content is escaped before rendering, colors are validated, and exported contact links accept email addresses only.
