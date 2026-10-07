# Releasing mmd-parser

After a release-preparation/version-bump PR is merged, the maintainer publishes
from a clean, updated `master` checkout with **`npm publish`**. npm builds the
package and runs deterministic release checks before uploading it. No tarball
needs to be retained or handed off from CI, an agent, or a temporary directory.
Authentication may be required separately. Registry verification and Git tagging
follow successful publication and are not required for Issue completion.

## Prepare and validate before merge

Update the version in `package.json` in the release-preparation PR. Preserve the
existing package file allowlist and conditional exports. Install the existing
development dependencies when setting up or updating the checkout:

```sh
npm install --no-package-lock --no-audit --no-fund
```

Run the deterministic checks and exercise the publish lifecycle without uploading
anything or requiring npm authentication:

```sh
npm run build-uglify
npm run typecheck
npm run test:offline
npm run test:package
npm publish --dry-run
git diff --check
git status --short
```

Include any changed tracked bundles and declarations in the preparation commit.
The dry-run contents must be exactly the four runtime bundles, eight declaration
files under `build/types/`, `package.json`, `Readme.md`, and `LICENSE` (15 files).
The package validator enforces this list. Source, tests, scripts, workflow files,
documentation guides, and intermediate build output are excluded. Do not add an
incidental lockfile or authentication files.

### What the npm lifecycle validates

`prepublishOnly` runs the existing scripts in order: `build-uglify`, `typecheck`,
`test:offline`, and `test:package`. It builds before testing so the checks use
fresh artifacts even when the checkout has missing or stale build output. Any
failure aborts publication before registry upload.

`test:package` internally runs `npm pack --ignore-scripts` on that completed
build. This skips the nested pack's lifecycle hooks, avoiding recursion and
unnecessary rebuilds during validation. It installs the resulting tarball in an
isolated temporary consumer outside the repository, verifies every installed
file, checks CommonJS and native ESM runtime consumers, and compiles strict
TypeScript consumers with legacy, Node16, NodeNext, and bundler resolution.
Runtime checks include the PMX additional UV morph regression. All temporary
consumer files and the validation tarball are removed, including on failure.
The local pack and install explicitly disable npm's inherited dry-run setting,
so `npm publish --dry-run` still exercises real consumer checks without uploading.
Standalone `npm run test:package` still requires a completed build; it also
accepts an existing tarball with `npm run test:package -- /path/to/package.tgz`.

After `prepublishOnly`, npm runs `prepack`, which uses `build-uglify` to produce
all bundles and declarations for the actual package. This deliberately builds
again because `prepublishOnly` runs before `prepack`. A standalone `npm pack`
also builds automatically through `prepack`, but does not run publish-only
checks. See npm's [lifecycle order](https://docs.npmjs.com/cli/v11/using-npm/scripts/).
Keep lifecycle scripts enabled for publication and its dry-run.

The network-dependent `npm test` sample smoke script remains available separately
(and through `npm run all`). It logs metadata without assertions and is not part
of the deterministic publication gate; the offline and installed-package checks
provide automated assertions without external sample downloads. No human-only
verification is required before merge.

The [1.1.1](release-1.1.1-validation.md) and
[1.1.2](release-1.1.2-validation.md) evidence files are historical records of the
previous release process. Their retained artifact paths and publication commands
do not define future releases.

## Publish after merge

Use a checkout with the development dependencies installed as above. Confirm the
release-preparation/version-bump PR is merged and `git status --short` is empty.
Before publication, record the source commit for later tagging with
`release_commit=$(git rev-parse HEAD)`:

```sh
git switch master
git pull --ff-only
git status --short
npm publish
```

Stop if the checkout is dirty or any lifecycle check fails. Plain `npm publish`
publishes this unscoped package publicly
with the default `latest` tag, using the maintainer's normal npm configuration.

If npm authentication is missing, run `npm login` separately using the
maintainer's normal user configuration, then retry `npm publish`. Complete any
interactive authentication or OTP prompts yourself. Keep credentials in user
configuration outside the repository; do not add an authenticated project
`.npmrc`, tokens, passwords, or OTPs to repository files or release evidence.
These scripts do not log in, manage credentials, or create/push Git tags.

If publication fails with an unclear outcome, check the registry version before
retrying. Published versions cannot be overwritten; if the version already
exists, verify it instead of trying to publish it again.

## Verify publication, then tag

After publication succeeds, verify the version and `latest` tag and test the
registry artifact. In the release checkout:

```sh
release_version=$(node -p "require('./package.json').version")
npm view "mmd-parser@$release_version" version dist.integrity
npm view mmd-parser dist-tags.latest
registry_tmp=$(mktemp -d)
npm pack "mmd-parser@$release_version" --pack-destination "$registry_tmp"
npm run test:package -- "$registry_tmp/mmd-parser-$release_version.tgz"
rm -r "$registry_tmp"
```

The reported version and `latest` tag must match the release version, and the
installed-package checks must pass. This temporary registry download is only for
post-publication verification; it is not an artifact needed to publish.

Only after successful publication and verification, create an annotated Git tag
on the source commit recorded before publication:

```sh
git tag -a "v$release_version" "$release_commit" -m "Release mmd-parser $release_version"
```

Tagging and any tag push remain separate, manual maintainer actions. If the tag
already exists, verify its target and do not move or force-push it. A tagging
failure after publication does not require publishing again. Actual publication,
registry verification, and tagging are future maintainer release actions, not
post-merge requirements for completing Issue #21.
