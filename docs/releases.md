# Release mmd-parser 1.1.1

Issue [#15](https://github.com/takahirox/mmd-parser/issues/15) prepares this release
for manual publication of an already validated tarball. All preparation and
package checks happen before merge, without npm credentials. Authentication,
publication, registry verification, and tagging are separate maintainer-only
follow-up actions. Required post-merge verification for Issue completion: **None**.
Do not publish or create/push `v1.1.1` during repository preparation.

## Prepare and validate before merge

The release checks have been validated with Node `24.12.0` and npm `11.6.2`.

See the [1.1.1 preparation evidence](release-1.1.1-validation.md) for the retained
artifact path, checksums, successful checks, and exact manual publish command.

Run the following preparation checks:

```sh
npm install --no-package-lock --no-audit --no-fund
npm run build-uglify
npm run typecheck
npm run test:offline
npm test
npm run test:package
git diff --check
```

`npm run all` builds the UMD, minified UMD, browser ES module, native ESM, and
declarations, checks strict types, runs offline fixtures, and runs the
network-dependent sample tests.
The online smoke script logs metadata without assertions: inspect its output for
successful PMD (`format: 'pmd'`), VMD (`motionCount: 14160`), and VPD
(`boneCount: 93`) parses. A zero exit code with missing samples is not a pass.

The package check packs the current build, validates every installed file, then
checks CommonJS and native Node ESM exports and parsing methods and strict
TypeScript imports of `Parser`, `Pmd`, `Pmx`, `Vmd`, and `Vpd` in a clean temporary
consumer outside the repository, using legacy, Node16, NodeNext, and bundler
resolution. It removes its temporary files even on failure. To check a specific
tarball, use `npm run test:package -- /path/to/package.tgz`.

Keep `package.json` at `1.1.1`, with its `main`, `jsnext:main`, `types`, conditional
`exports`, and `files` entries. The root export selects the `.mjs` bundle and
`.d.mts` declaration entry for imports, and the UMD bundle and `.d.ts` entry for
CommonJS; existing browser bundle subpaths remain available. The allowlist
distributes only runtime bundles and `build/types/`; npm also includes
`package.json`, `Readme.md`, and `LICENSE`.
Source, tests, scripts, workflow files, documentation guides, and intermediate
build output are excluded. Keep dependency ranges unchanged and do not add an
incidental lockfile.

### Pack and retain the exact release artifact

After the checks above pass, pack outside the repository, inspect the file list,
and test this exact tarball in the isolated consumer:

```sh
release_tmp=$(mktemp -d "${TMPDIR:-/tmp}/mmd-parser-1.1.1-release.XXXXXX")
release_tarball="$release_tmp/mmd-parser-1.1.1.tgz"
npm pack --json --pack-destination "$release_tmp"
tar -tzf "$release_tarball"
npm run test:package -- "$release_tarball"
(cd "$release_tmp" && shasum -a 256 mmd-parser-1.1.1.tgz > SHA256SUMS)
git diff --check
git status --short
```

Inspect the pack output's name (`mmd-parser`), version (`1.1.1`), file list,
and integrity. Include any changed tracked bundles and declarations in the
preparation commit. The consumer check must pass for this tarball. Record the
validation results, source revision, absolute artifact path, SHA-256, and npm
integrity in release evidence. Preserve the tarball and `SHA256SUMS` outside the
repository, and hand them to the maintainer; temporary directories may be cleaned
by the OS, so move them to durable local storage when needed. Do not commit the
tarball or npm authentication files.

The artifact must contain exactly the four runtime bundles, the public declaration
tree, `package.json`, `Readme.md`, and `LICENSE`; `test:package` enforces this list.
Do not edit packaged files or rebuild after packing. If they change, rerun the
preparation checks, pack again, and replace the release evidence. Changes to
excluded release documentation do not change the package. The maintainer uses
this retained artifact after merge; another build/pack cycle is not required.

## Maintainer-only follow-up after merge

These actions do not block PR approval or Issue completion. Run them in order in
one shell and stop if any check fails. A valid npm session leaves only the publish
command as the action needed to make the validated package public; verification
and tagging follow publication.

### 1. Select the retained artifact and merged source commit

Start with a clean checkout of updated `master`, confirm the preparation change
is merged, and record the commit to tag after successful publication:

```sh
git switch master
git pull --ff-only
git status --short
node -e 'const p = require("./package.json"); if (p.name !== "mmd-parser" || p.version !== "1.1.1") throw new Error("Expected mmd-parser@1.1.1");'
release_commit=$(git rev-parse HEAD)
# Replace this path with the retained directory from the preparation evidence.
release_tmp=/absolute/path/to/validated-release
release_tarball="$release_tmp/mmd-parser-1.1.1.tgz"
(cd "$release_tmp" && shasum -a 256 -c SHA256SUMS)
```

`git status --short` must be empty. Confirm the selected commit's packaged files
match the validated preparation revision, and check the checksum against the
recorded release evidence. If packaged files changed during or after merge,
repeat **Prepare and validate before merge** on that revision before publishing.
No credentials, registry checks, or Git tags are needed for preparation approval.

### 2. Authenticate if needed and publish the validated tarball

Use the maintainer's npm account with publish access to `mmd-parser`. Check the
current login and, if needed, log in from the home directory using the user
configuration file outside the checkout:

```sh
npm whoami --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org
# Run only if login is needed; complete the browser authentication/2FA prompts.
(cd "$HOME" && npm login --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org)
npm whoami --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org
```

Keep npm authentication in the local user configuration (`$HOME/.npmrc`), which
must be outside the repository. Never put tokens, credentials, or one-time codes
in repository files, a project `.npmrc`, GitHub secrets, commits, or release
evidence. Follow npm's [login documentation](https://docs.npmjs.com/cli/v11/commands/npm-login/)
for interactive authentication.

Before publishing, check whether the version already exists:

```sh
npm view mmd-parser@1.1.1 version --registry=https://registry.npmjs.org
```

Proceed only if the registry explicitly reports that `1.1.1` does not exist
(`E404`). Resolve network or authentication errors before proceeding. If the
version exists, skip publication and verify that registry artifact instead.

Publish the validated tarball as public `mmd-parser@1.1.1` with the `latest` tag,
completing npm's interactive authentication/2FA prompts as needed:

```sh
npm publish "$release_tarball" --access public --tag latest --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org
```

See [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) for tarball
publication. If the command fails or its outcome is unclear, check the registry
before retrying. npm versions are immutable: if publication succeeded, continue
verification rather than attempting to republish or changing the version.

### 3. Verify the registry artifact

Confirm the registry version is `1.1.1` and the `latest` dist-tag points to it:

```sh
npm view mmd-parser@1.1.1 version dist.integrity --registry=https://registry.npmjs.org
npm view mmd-parser dist-tags.latest --registry=https://registry.npmjs.org
registry_tmp=$(mktemp -d)
npm pack mmd-parser@1.1.1 --pack-destination "$registry_tmp" --registry=https://registry.npmjs.org
cmp "$release_tarball" "$registry_tmp/mmd-parser-1.1.1.tgz"
npm run test:package -- "$registry_tmp/mmd-parser-1.1.1.tgz"
```

The integrity must match the local pack output, and `cmp` must confirm identical
tarballs. The consumer check installs the registry artifact in a clean temporary
project and verifies its CommonJS and native ESM runtime API and strict TypeScript
declarations. Repository source cannot mask missing published files.

### 4. Tag the validated commit and record the result

After publication and registry verification succeed, create and push only the
annotated release tag on the recorded commit:

```sh
git tag -a v1.1.1 "$release_commit" -m "Release mmd-parser 1.1.1"
git push origin v1.1.1
rm -r "$release_tmp" "$registry_tmp"
```

Tagging records the published source commit; it does not publish a package.
If `v1.1.1` already exists locally or remotely, confirm it points to
`release_commit` and do not move or force-push it. If a tag push fails after
successful publication, finish tagging without publishing again.

Record the release commit/tag, successful publication, registry version/integrity,
and runtime/TypeScript consumer results on the merged PR. If publication or
verification finds a problem, preserve the artifact and evidence and create a
focused follow-up Issue describing the problem and remaining work. Do not add
the `Task` label to that Issue; triage it separately. Pending post-merge results
do not prevent pre-merge approval or source Issue closure.
