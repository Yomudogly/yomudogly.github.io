# Yomud

Static landing page for https://yomudogly.github.io/. No runtime dependencies or package installation required. Build with Node 22+ (CI uses Node 24).

## Local checks

```sh
npm test          # Behavior/content/link checks; no files written
npm run lint     # JavaScript syntax checks
npm run build    # Validate source, recreate dist/, verify deployment allowlist
npm run preview  # Serve dist at http://127.0.0.1:4174 (requires Python 3)
```

Edit `index.html`, `styles.css`, and `script.js`. Public images are optimized WebP files in `assets/`. The static city illustration links to Google Maps; it is not a navigation map. Google Fonts loads externally, with system-font fallbacks. The page has no forms, analytics, backend, or live map libraries.

## GitHub Pages

`.github/workflows/pages.yml` validates pull requests and deploys successful builds from `master` (or a manual run on `master`). Only `dist/` is uploaded. Private `.omx/` state, development scripts, and source metadata cannot enter the artifact.

Before the first workflow deployment, change repository **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The repository was using the legacy `master` root publishing source when this setup was prepared. Keep HTTPS enforcement enabled; no custom domain or `CNAME` is needed.

After the deployment changes are committed and pushed to `master`, inspect the GitHub Pages workflow and verify https://yomudogly.github.io/. Preparation does not itself change repository settings or publish the local work.

To restore an earlier version, revert the change on `master` and let the workflow redeploy. Don't manually modify `dist/`.

## Content constraints

Use the business name Yomud, anonymous prior-work examples, and the confirmed phone contact links. Support wording is “Requests accepted 24/7. Response times agreed with each client.” Do not add personal names, client endorsements, performance metrics, forms, or tracking without an explicit request.
