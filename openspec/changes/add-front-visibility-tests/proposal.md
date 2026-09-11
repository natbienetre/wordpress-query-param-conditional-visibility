## Why

The plugin has zero test coverage today: the only PHPUnit test is excluded, and no JS test tooling is wired up despite `@wordpress/scripts` bundling Jest out of the box. All of the plugin's actual logic lives client-side in `scripts/front.tsx` (the hide/show decision and DOM cleanup applied on `domReady`) and `scripts/editor.tsx` (the editor-side attribute/data contract). Reading `front.tsx` closely while scoping these tests surfaced a real, confirmed defect: the "remove now-empty ancestor wrappers" cleanup walks every ancestor up to `<html>` and only checks `.text().trim() === ''`, so it can delete non-text content (e.g. an `<img>`-only wrapper) and, in the worst case, delete `<body>`/`<html>` entirely if the hidden block was the only text-bearing content reachable from the page root. This was reproduced directly against the current code, not just inferred from reading it.

## What Changes

- Extract the hide/show predicate and the DOM-scan/cleanup routine out of `scripts/front.tsx`'s `domReady` callback into named, exported functions (`shouldHideBlock`, `applyVisibility`) so they are directly unit-testable, with no behavior change to the extraction itself.
- **Fix the ancestor-cleanup defect**: bound the "remove empty wrapper" walk so it never removes an ancestor at or above the `.site` boundary, and never removes an ancestor that still contains non-text content (images, media, etc.) after the hidden block is removed. This is a behavior change to the cleanup routine; the hide/show decision itself (which blocks get removed) is unchanged.
- Export `register` and `save` from `scripts/editor.tsx` (currently unexported consts) so the editor-side attribute/data-attribute contract is directly testable. No behavior change.
- Add Jest unit tests covering: the hide/show predicate (including the existing OR-across-multiple-conditions semantics, and the absent-query-param and empty-conditions edge cases), the DOM cleanup routine (safe removal, the img-wrapper regression case, and the bounded-walk fix), and the editor's attribute/save-filter contract.
- Wire `wp-scripts test-unit-js` into `package.json` (`test:unit`) and run it in CI (`build.yml`).

Out of scope: `scripts/query-params-editor.tsx` (the block-editor add/remove condition UI) is not covered by this change — testing it well would need a new dependency (`@testing-library/react`), which is a separate decision.

## Capabilities

### New Capabilities
- `query-param-visibility`: the front-end contract for conditionally hiding/showing a block based on the current page's query string, and the DOM cleanup that follows a hide decision.

### Modified Capabilities
(none — no existing specs in this repo yet)

## Impact

- Affected code: `scripts/front.tsx`, `scripts/editor.tsx`, `package.json`, `.github/workflows/build.yml`.
- New files: `scripts/test/front.test.ts`, `scripts/test/editor.test.tsx`.
- No new runtime dependencies; `@wordpress/scripts`' bundled Jest preset (`test-unit-js`) is already installed.
- Behavior change for site visitors: a block that is hidden will no longer, in rare cases, cause deletion of unrelated non-text ancestor content or (in the worst case) `<body>`/`<html>`.
