# Release mmd-parser 1.1.0

Issue [#9](https://github.com/takahirox/mmd-parser/issues/9) prepares the
TypeScript-enabled package for release. Publication and registry verification
happen after merge; neither npm account configuration nor publication is a
pre-merge condition.

## Validate before merge

Use Node `24.12.0` and npm `11.6.2`, matching the release workflow:

```sh
npm install --no-package-lock --no-audit --no-fund
npm run all
npm run test:package
git diff --check
```

The package check packs the current build, lists and validates every installed
file, then installs that artifact in a clean temporary consumer. It checks the
existing CommonJS exports and parsing methods, plus strict TypeScript imports of
`Parser`, `Pmd`, `Pmx`, `Vmd`, and `Vpd` from `mmd-parser`, with no path aliases or
local source imports. Temporary artifacts are removed even when a check fails.
To test an already packed artifact, use `npm run test:package -- /path/to/package.tgz`.

The `files` allowlist includes the UMD, minified UMD, ES module, and `build/types/`
declarations. npm also includes `package.json`, `Readme.md`, and `LICENSE`.
Source, tests, scripts, workflow files, documentation guides, and intermediate
build output are excluded. Existing dependency ranges and runtime entry points
are preserved; installation does not introduce a lockfile.

## One-time npm Trusted Publisher configuration

A package maintainer must open the `mmd-parser` package's settings on npmjs.com
and add a GitHub Actions Trusted Publisher with these exact values:

| Setting | Value |
| --- | --- |
| Organization or user | `takahirox` |
| Repository | `mmd-parser` |
| Workflow filename | `publish.yml` (filename only; stored at `.github/workflows/publish.yml`) |
| Environment name | Leave blank; the workflow uses no GitHub environment |
| Allowed action | Enable direct publishing with `npm publish` |

See [npm's Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/).
OIDC requires a GitHub-hosted runner, Node >= `22.14.0`, and npm >= `11.5.1`.
New publisher configurations may only allow staged publishing by default, so
enable `npm publish` for this workflow. GitHub OIDC publication automatically
generates provenance for this public repository/package.

The workflow uses only `contents: read` and, in the publish job, `id-token: write`.
It needs no npm write secret or `NODE_AUTH_TOKEN`. Do not substitute a long-lived
token if setup fails. If npm requests interactive account authentication or 2FA,
record that the package maintainer must authenticate and save the exact Trusted
Publisher configuration above. That is an external post-merge setup blocker.

## Publish after merge

1. Configure the Trusted Publisher above, if needed.
2. On updated `master`, confirm the release change is merged and the package
   version is `1.1.0`. Run the pre-merge validation commands again if the release
   commit has changed.
3. Create and push only the annotated tag `v1.1.0` on that merged commit:

   ```sh
   git switch master
   git pull --ff-only
   git tag -a v1.1.0 -m "Release mmd-parser 1.1.0"
   git push origin v1.1.0
   ```

4. Watch the `Publish mmd-parser 1.1.0` run in GitHub Actions. Only the exact
   `v1.1.0` tag triggers `.github/workflows/publish.yml`. It rejects a package
   version mismatch, a different package name, or a commit outside `master`.
   It runs `build-uglify`, strict `typecheck`, offline tests, and `npm test`.
   Because the legacy online smoke script logs metadata, the workflow also
   requires output confirming all PMD, VMD, and VPD samples parsed successfully.
5. The workflow packs, inspects, and tests one tarball, then publishes that same
   tarball as public `mmd-parser@1.1.0` with the `latest` dist-tag via OIDC.

This workflow has no branch, manual, or wildcard tag trigger. Concurrent release
runs are serialized. For a failed run, fix the reported cause and rerun only if
`1.1.0` has not already been published. If publication succeeded but a later
verification failed, perform verification instead of trying to republish the
immutable version. Do not move the release tag or publish a different version
under this procedure; a future release requires a reviewed workflow/version update.

## Verify the published package

After a successful run, confirm the registry version and provenance:

```sh
npm view mmd-parser@1.1.0 version dist.integrity dist.attestations --registry=https://registry.npmjs.org
```

From this checkout with development dependencies installed, download the registry
artifact and run the same isolated consumer check against it:

```sh
release_tmp=$(mktemp -d)
npm pack mmd-parser@1.1.0 --pack-destination "$release_tmp" --registry=https://registry.npmjs.org
npm run test:package -- "$release_tmp/mmd-parser-1.1.0.tgz"
rm -r "$release_tmp"
```

The check installs the registry tarball in a clean temporary project and verifies
its runtime API and declarations, so repository source cannot mask missing
published files. Record the publish workflow run URL, registry result, and consumer
check result on the merged PR or a follow-up Issue. If blocked, record the exact
external configuration/authentication step remaining there. Pending post-merge
results do not prevent pre-merge approval or source Issue closure.
