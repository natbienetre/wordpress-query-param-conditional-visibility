## 1. Make `front.tsx` testable and fix the ancestor-cleanup defect

- [x] 1.1 Extract the hide/show comparison into an exported `shouldHideBlock(conditions, searchParams)` function; verify `scripts/front.tsx` still compiles (`npm run compile:js`) with no behavior change to the existing hide/show decision
- [x] 1.2 Extract the `domReady` callback's body into an exported `applyVisibility()` function, computing `currentURL` inside the function rather than at module scope, and keep `domReady(applyVisibility)` wired at module scope; verify `npm run compile:js` still succeeds
- [x] 1.3 Bound the ancestor-cleanup walk so it never considers `.site` or anything above it, and never removes an ancestor that still has non-text content after the block is removed; verify against the reproduction from proposal.md (a hidden block whose only sibling is an `<img>` no longer causes the wrapper, `.site`, `body`, or `html` to be removed)

## 2. Export the editor-side attribute/save contract

- [x] 2.1 Extract `register` and `save` into a new `scripts/attributes.ts` module (re-exported from `scripts/editor.tsx` for the production filter registrations), since exporting them in place from `editor.tsx` pulled in an ESM-incompatible transitive dependency tree when imported from a test (see design.md decision update); verify `npm run compile:js` still succeeds

## 3. Add JS unit tests

- [x] 3.1 Add `scripts/test/front.test.ts` covering `shouldHideBlock`: single-condition match/no-match/absent-param, multi-condition OR semantics (any match shows, none match hides), and the empty-conditions edge case; verify with `npm run test:unit` (added in 4.1)
- [x] 3.2 Add DOM-level tests in `scripts/test/front.test.ts` for `applyVisibility`: a matching block stays and loses its data marker, a non-matching block is removed, an ancestor left with no content is removed, an ancestor with remaining non-text content (image) is preserved, and cleanup never removes `.site`/`body`/`html`; verify with `npm run test:unit`
- [x] 3.3 Add `scripts/test/attributes.test.ts` (instead of `editor.test.tsx`, per the 2.1 extraction) covering `register` (attribute always added to block settings) and `save` (data attribute added only when conditions are non-empty, omitted when empty); verify with `npm run test:unit`

## 4. Wire test running into the project

- [x] 4.1 Add a `test:unit` script to `package.json` running `wp-scripts test-unit-js`; verify `npm run test:unit` runs and all tests from section 3 pass
- [x] 4.2 Add a step running `npm run test:unit` to `.github/workflows/build.yml`; verify by opening a PR and confirming the new step runs and passes in CI
