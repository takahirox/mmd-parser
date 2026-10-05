# Release mmd-parser 1.1.0

Issue [#11](https://github.com/takahirox/mmd-parser/issues/11) simplifies this
release to manual npm publication from the maintainer's local checkout.
Publication, tagging, and registry verification are separate post-merge actions;
do not publish or push a release tag while preparing this cleanup change.

## Validate before merge

The release checks have been validated with Node `24.12.0` and npm `11.6.2`:

```sh
npm install --no-package-lock --no-audit --no-fund
npm run all
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

Keep `package.json` at `1.1.0`, with its `main`, `jsnext:main`, `types`, conditional
`exports`, and `files` entries. The root export selects the `.mjs` bundle and
`.d.mts` declaration entry for imports, and the UMD bundle and `.d.ts` entry for
CommonJS; existing browser bundle subpaths remain available. The allowlist
distributes only runtime bundles and `build/types/`; npm also includes
`package.json`, `Readme.md`, and `LICENSE`.
Source, tests, scripts, workflow files, documentation guides, and intermediate
build output are excluded. Keep dependency ranges unchanged and do not add an
incidental lockfile.

## Publish locally after merge

Run the following steps in order in one shell. Stop if any check fails.

### 1. Update and validate master

Start with a clean local checkout, confirm the release cleanup is merged, and
update `master`:

```sh
git switch master
git pull --ff-only
git status --short
node -e 'const p = require("./package.json"); if (p.name !== "mmd-parser" || p.version !== "1.1.0") throw new Error("Expected mmd-parser@1.1.0");'
release_commit=$(git rev-parse HEAD)
```

`git status --short` must be empty. Repeat all commands in **Validate before
merge** on this commit and inspect the online sample output. Then run
`git status --short` again: it must still be empty, including generated bundles
and declarations. If rebuilding changes tracked files, resolve and merge those
changes before restarting this procedure. Record `release_commit`; it is the
commit to tag after publication and verification succeed.

### 2. Pack, inspect, and test the release artifact

Keep the artifact outside the repository and use this exact tarball for both
validation and publication:

```sh
release_tmp=$(mktemp -d)
npm pack --json --pack-destination "$release_tmp"
tar -tzf "$release_tmp/mmd-parser-1.1.0.tgz"
npm run test:package -- "$release_tmp/mmd-parser-1.1.0.tgz"
```

Inspect the pack output's name, version, file list, and integrity. The consumer
check must pass for this tarball. Preserve it until registry verification is
complete. Do not edit package files or rebuild after packing; if changes are
needed, restart validation and packing on the updated, merged commit.

### 3. Authenticate locally and publish the validated tarball

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
npm view mmd-parser@1.1.0 version --registry=https://registry.npmjs.org
```

Proceed only if the registry explicitly reports that `1.1.0` does not exist
(`E404`). Resolve network or authentication errors before proceeding. If the
version exists, skip publication and verify that registry artifact instead.

Publish the validated tarball as public `mmd-parser@1.1.0` with the `latest` tag,
completing npm's interactive authentication/2FA prompts as needed:

```sh
npm publish "$release_tmp/mmd-parser-1.1.0.tgz" --access public --tag latest --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org
```

See [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) for tarball
publication. If the command fails or its outcome is unclear, check the registry
before retrying. npm versions are immutable: if publication succeeded, continue
verification rather than attempting to republish or changing the version.

### 4. Verify the registry artifact

Confirm the registry version is `1.1.0` and the `latest` dist-tag points to it:

```sh
npm view mmd-parser@1.1.0 version dist.integrity --registry=https://registry.npmjs.org
npm view mmd-parser dist-tags.latest --registry=https://registry.npmjs.org
registry_tmp=$(mktemp -d)
npm pack mmd-parser@1.1.0 --pack-destination "$registry_tmp" --registry=https://registry.npmjs.org
cmp "$release_tmp/mmd-parser-1.1.0.tgz" "$registry_tmp/mmd-parser-1.1.0.tgz"
npm run test:package -- "$registry_tmp/mmd-parser-1.1.0.tgz"
```

The integrity must match the local pack output, and `cmp` must confirm identical
tarballs. The consumer check installs the registry artifact in a clean temporary
project and verifies its CommonJS and native ESM runtime API and strict TypeScript
declarations. Repository source cannot mask missing published files.

### 5. Tag the validated commit and record the result

After publication and registry verification succeed, create and push only the
annotated release tag on the recorded commit:

```sh
git tag -a v1.1.0 "$release_commit" -m "Release mmd-parser 1.1.0"
git push origin v1.1.0
rm -r "$release_tmp" "$registry_tmp"
```

Tagging records the published source commit; it does not publish a package.
If `v1.1.0` already exists locally or remotely, confirm it points to
`release_commit` and do not move or force-push it. If a tag push fails after
successful publication, finish tagging without publishing again.

Record the release commit/tag, successful publication, registry version/integrity,
and runtime/TypeScript consumer results on the merged PR. If publication or
verification finds a problem, preserve the artifact and evidence and create a
focused follow-up Issue describing the problem and remaining work. Do not add
the `Task` label to that Issue; triage it separately. Pending post-merge results
do not prevent pre-merge approval or source Issue closure.
