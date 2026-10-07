# 002: Separate saved pages, recovery drafts, and editing history

Status: accepted

## Context

A website editor must preserve work without making every preview change the saved website. Section operations also need a predictable undo path. Browser storage can be unavailable or full, particularly when images are embedded.

## Decision

Keep three representations:

- The project store owns the saved website.
- The editor owns a bounded history of plain website snapshots.
- The draft adapter stores unsaved recovery snapshots under project-specific keys.

Compare the current website with the saved baseline to determine dirty state. Saving only advances that baseline after persistent storage succeeds. Close and unload guards protect dirty state; reopening restores the draft. Consecutive typing in the same field within 700 ms is grouped, and saving creates a grouping boundary.

Sections are ordered serializable records, capped at 20 per page. A small renderer registry maps allowed types to HTML. Navigation is derived from those records, so reordering or deleting a section updates its corresponding link. The hero remains the primary page heading. Uploaded PNG/JPEG/WebP images are embedded, with a 1 MB upload limit; HTTPS image references are also accepted.

## Consequences

Saved pages remain stable until an explicit save. Preview and export use the same current snapshot. Drafts survive a reload when browser storage is available; undo history is intentionally limited to the current editor session. Snapshot history is straightforward to test and can consume more memory than inverse commands when pages contain images.

Storage quotas remain browser-dependent. Failed persistence keeps the session editable, reports the failure, and leaves the page dirty. Embedded images improve portability at the cost of larger storage and backups. A larger asset library should use an asset repository rather than increasing these limits indefinitely.

## Verification

Unit tests cover normalization, section ordering, history grouping/branching, draft recovery, image source validation, and output escaping. Playwright runs the built application at desktop and mobile sizes. It covers saving, recovering, section edits, undo/redo, image uploads, standalone output, failed storage, Escape cancellation, and automated accessibility checks.

The editor's preview is sandboxed. The accessibility integration audits the editor without traversing that frame, then audits exported HTML independently. This preserves the preview sandbox while testing both surfaces. Manual visual and screen-reader review remains necessary.
