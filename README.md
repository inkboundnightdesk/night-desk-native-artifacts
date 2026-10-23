# Night Desk native artifact mirror

Public third-party build artifacts only. Never publish Night Desk application
code, user data, configuration, or credentials here.

## One-time activation

The GitHub connection used to create this repository cannot write workflow
files. Using GitHub's web editor, move `maintenance/maintain.yml` to
`.github/workflows/maintain.yml`, commit to `main`, then open Actions →
Maintain pinned validator mirror → Run workflow.

The first successful run creates the pinned release with the unchanged upstream
archive, license, corresponding FFmpeg source archive, build recipes, provenance
and checksums. Binaries are release assets, never Git objects. Do not delete or
replace a published pinned release.

## Maintenance

The scheduled Monday check downloads and verifies the entire mirrored archive,
checks upstream availability, and fails when newer releases/build revisions need
review. It never automatically upgrades executable code or changes a checksum.
Watch Actions failure notifications. GitHub can disable scheduled workflows in
inactive public repositories; review the Actions schedule at least monthly and
re-enable it if necessary. This is not an unattended security guarantee or a CVE
audit.

To approve an update, inspect upstream security/release notes and LGPL licensing,
verify an independently obtained SHA256, choose a new immutable release tag,
and update the manifest and source references together. Publish and verify the
new mirror first. Then update the private app's matching manifest, run its
production-mode native validation tests and packaged-native smoke checks, and
open a reviewed application PR. Retain old releases for reproducible rebuilds.

Application download failures may use the original pinned upstream URL.
Integrity failures never fall back or disable validation. Existing packaged
license/source information and compressed executable distribution remain;
user videos are never compressed or re-encoded by this change.
