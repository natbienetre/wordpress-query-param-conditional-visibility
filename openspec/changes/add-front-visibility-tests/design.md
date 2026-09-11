## Context

See proposal.md - Why/What Changes. Two files carry the plugin's actual behavior: `scripts/front.tsx` (runs on `domReady`, does the DOM scan/hide/cleanup) and `scripts/editor.tsx` (registers the block attribute and, on save, serializes it into a `data-*` attribute). Both currently run their logic as anonymous inline callbacks / unexported consts wired straight into `domReady(...)` and `addFilter(...)` at module scope, with no exports to call directly from a test.

`@wordpress/scripts` already bundles a Jest config (`wp-scripts test-unit-js`, jsdom environment) - no new test runner or dependency is needed for what this change covers.

## Goals / Non-Goals

**Goals:**
- Make the hide/show predicate and the DOM cleanup routine callable directly from tests, without relying on `domReady`'s reexecution-on-import timing or needing to reset/reimport modules per test case.
- Fix the ancestor-cleanup over-deletion defect (see proposal.md - Why) as part of making it testable, since a passing test asserting the current destructive behavior isn't something to commit quietly.
- Keep the hide/show decision itself unchanged - only the *cleanup after* a hide decision is bounded.

**Non-Goals:**
- Changing the OR-across-multiple-conditions semantics. It's undocumented in the readme/UI, but nothing in this change indicates it's wrong, and changing it would be a product decision, not a test-writing one. This change documents it via tests instead.
- Testing `scripts/query-params-editor.tsx` (the editor UI for adding/removing conditions) - would need `@testing-library/react` as a new dependency, out of scope per proposal.md.
- End-to-end/browser testing (full editor -> save -> front-end round trip) - a much larger effort (`wp-env` + Playwright), not attempted here.

## Decisions

**Extract `shouldHideBlock(conditions, searchParams)` as a pure, exported function.** Alternative considered: test the whole `domReady` callback end-to-end via `jest.resetModules()` + dynamic re-import per test case, varying `window.location.href` and `document.body.innerHTML` before each import. Rejected: it's fragile (relies on jsdom's `document.readyState` already being `'complete'` at import time to trigger the callback synchronously) and makes the OR/AND semantics tests (which don't need any DOM at all) unnecessarily slow and indirect. A pure function is trivial to test and matches how the predicate is actually used (called once per matched element, independent of DOM state).

**Extract `applyVisibility()` as a directly-callable exported function, still wired to `domReady(applyVisibility)` at module scope for production.** Same rationale: production behavior is unchanged (still runs once per real page load via `domReady`), but tests can call `applyVisibility()` directly after setting up `document.body.innerHTML` and `window.location`, with no module-reset gymnastics. `currentURL` moves from a module-top-level `const` into the top of `applyVisibility()` itself, computed fresh on each call - this doesn't change production behavior (the function still only runs once per page load) but is required for calling it more than once across test cases within the same test file.

**Bound the ancestor-cleanup walk at two levels**, per the spec's "Hiding a block does not remove unrelated page content" requirement:
1. Stop the walk at (and exclude) the `.site` boundary - never consider `.site` itself or any of its ancestors for removal. Alternative considered: don't special-case `.site` and instead rely solely on the non-text-content check below. Rejected: relying only on the content check is not defense in depth - a page whose entire body has no text anywhere outside the hidden block (a real, previously-reproduced case) would still walk all the way up and delete `<body>`/`<html>`. The `.site` boundary is already the scan's own root selector (`jQuery('.site').find(...)`), so bounding cleanup at the same boundary is a direct match to the existing scan scope, not a new concept.
2. Skip any ancestor that still has non-text content (checked via a lightweight "any element children besides ones that produce visible content are absent" check, not just `.text().trim() === ''`) - covers the `<img>`-only-wrapper regression case directly.

Concretely, this means walking `$block.parents()` but filtering out anything at or beyond `.site`, and changing the emptiness check from pure `.text()` to also account for meaningful non-text children before removing.

**Extract `register` and `save` into a new `scripts/attributes.ts` module, imported and re-exported by `editor.tsx`**, rather than exporting them in place from `editor.tsx` as originally planned. Alternative considered (and initially attempted): just add `export` to the existing `register`/`save` consts in `editor.tsx`. Rejected after hitting it directly: importing `editor.tsx` from a test pulls in its `@wordpress/block-editor`/`@wordpress/components` imports (needed only by the `edit` HOC, not by `register`/`save`), and several transitive packages in that tree ship ESM-only builds (`uuid`, `@wordpress/theme`, `@wordpress/blocks`'s markdown/paste-handling, and more) that Jest's default CJS transform can't load. Patching `transformIgnorePatterns` per offending package turned out to be open-ended (each fix surfaced the next one), not a bounded solution. Extracting `register`/`save` (and the `React.cloneElement` call `save` needs) into their own module with no editor-UI imports sidesteps the whole dependency tree - tests import only `attributes.ts` and `front.tsx`, both dependency-light. This also independently confirms the original rationale (avoiding filter-registry indirection) was right, just not sufficient on its own - the problem was the *module's* transitive imports, not the test approach. Testing the filters for real via `applyFilters` was still not pursued, since it would still require importing `editor.tsx` and hitting the same wall.

## Risks / Trade-offs

- [Risk] Bounding cleanup at `.site` means a hidden block's *direct* non-`.site`-scoped ancestor wrappers outside that boundary (if the plugin were ever used with a different theme structure without a `.site` wrapper) would never be cleaned up, even if genuinely empty. -> Mitigation: this matches the scan's own existing root selector (`jQuery('.site')`), so it's consistent with an existing assumption already baked into the plugin, not a new constraint.
- [Risk] The non-text-content check could itself under- or over-detect "meaningful content" for content types not considered here (e.g. an empty `<svg>`, a zero-size spacer `<div>`). -> Mitigation: tests cover the concrete case that was reproduced (`<img>`); this is a bounded first fix, not a claim of covering every content type. Documented as a known limitation if it recurs.
- [Risk] Making `currentURL` computed per-call in `applyVisibility()` instead of once at module load is a micro behavior change (a `pushState`-based SPA navigation without a full reload would now be picked up on next call, whereas before the module was only ever evaluated once). -> Mitigation: this plugin runs once per real page load with no SPA routing in play; the change has no observable effect in the plugin's actual usage.

## Open Questions

None - the OR-vs-AND semantics question is answered (kept as-is, documented via tests per Non-Goals), and the cleanup-bound approach is decided above.
