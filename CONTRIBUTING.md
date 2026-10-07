# Developing Web Studio

Use Node.js 24 (`nvm use` when available), run `npm ci`, then `npm run dev`.

Read [the architecture](docs/ARCHITECTURE.md) before changing module boundaries. Business rules belong in feature models or stores; DOM listeners belong in controllers; reusable browser mechanics belong in `src/shared/`.

For each change:

1. Make the smallest complete change that implements the behavior.
2. Add regression coverage for changed business rules or serialization contracts.
3. Run `npm run check` and `git diff --check`.
4. Check the interface in a browser at desktop and narrow widths when changing UI.
5. Update usage documentation or an architecture decision when behavior or boundaries change.

Use two spaces, UTF-8, LF line endings, and descriptive function names. Comments should explain constraints or decisions that the code does not make obvious. Keep tests focused on observable behavior rather than matching implementation details.

Before reviewing a website export, open its downloaded `index.html` independently. Confirm the content, responsive layout, and contact link work without the workspace server.
