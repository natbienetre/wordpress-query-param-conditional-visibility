## Why

Both CI workflows (`.github/workflows/build.yml` and `.github/workflows/release.yaml`) install
dependencies with `npm install --dev`. Unlike `npm ci`, `npm install` does not fail when
`package-lock.json` is out of sync with `package.json` — it silently rewrites the lockfile to
reconcile the two and continues. That means a PR that edits `package.json` without regenerating
`package-lock.json` (or that has a stale/corrupted lockfile) will pass CI with a lockfile CI never
actually validated, and the built artifact may differ from what a contributor's local
`npm install` would produce. CI should instead fail fast when the committed lockfile does not
match `package.json`, and should install exactly what the lockfile specifies (matching what a
release build and a fresh contributor checkout will get).

## What Changes

- Replace `npm install --dev` with `npm ci` in both `.github/workflows/build.yml` and
  `.github/workflows/release.yaml`, so CI fails whenever `package-lock.json` is missing, stale, or
  inconsistent with `package.json` (`npm ci` refuses to proceed and reconcile silently, unlike
  `npm install`).
- No new script or separate "validate lockfile" step is introduced — `npm ci`'s existing built-in
  strictness is the validation mechanism; no code needs to be written to reimplement it.

## Capabilities

Pure CI/tooling change: it changes how dependencies are installed in CI, not any behavior of the
`query-param-visibility` plugin. No spec-level requirement is added or modified, so this change
sets `skip_specs: true` in `.openspec.yaml` and declares no capabilities.

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- `.github/workflows/build.yml`: `Install dependencies` step (`npm install --dev` → `npm ci`).
- `.github/workflows/release.yaml`: `Install dependencies` step (`npm install --dev` → `npm ci`).
- No impact on `package.json`, `package-lock.json` content, plugin runtime, or build output —
  `npm ci` installs the exact same resolved tree the current lockfile already describes, it just
  refuses to proceed if that tree doesn't match `package.json`.
- Contributors: no workflow change. Local development still uses `npm install` (unaffected); only
  CI's installation step changes.
