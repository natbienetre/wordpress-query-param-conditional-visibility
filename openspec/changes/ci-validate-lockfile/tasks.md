## 1. CI workflow changes

- [x] 1.1 Replace `npm install --dev` with `npm ci` in the `Install dependencies` step of
      `.github/workflows/build.yml`. Verify by running `npm ci` locally against the committed
      `package-lock.json` and confirming it succeeds with no lockfile changes
      (`git status --short package-lock.json` empty afterwards).
- [x] 1.2 Replace `npm install --dev` with `npm ci` in the `Install dependencies` step of
      `.github/workflows/release.yaml`. Verify the same way as 1.1.

## 2. Verification

- [ ] 2.1 Open a PR with these changes and confirm the `build` workflow (`Install dependencies`,
      `Test`, `Build` steps) passes end to end on CI.
- [x] 2.2 Confirm `npm run test:unit` and `npm run bundle` still succeed after `npm ci` installs
      dependencies (same commands the `build` job already runs), so the swap from `npm install` to
      `npm ci` does not change what gets installed or built.
