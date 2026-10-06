# mmd-parser 1.1.2 preparation evidence

Prepared for Issue [#19](https://github.com/takahirox/mmd-parser/issues/19) on
2026-10-06 with Node `24.12.0` and npm `11.6.2`.

Source commit: `7d739fb6b8ea6eb420b4574cb7e98d6d126d5c23`
(`Prepare mmd-parser 1.1.2 for manual publication (#19)`), based on upstream
`f06122dc417a9e5408da6e05baacaa813e0c49a4`. It includes the PMX additional UV
morph fix merged through Issue [#17](https://github.com/takahirox/mmd-parser/issues/17)
/ PR [#18](https://github.com/takahirox/mmd-parser/pull/18).

All 15 files in the retained tarball were compared byte for byte with their
tracked contents at this source commit and matched. No packaged files changed
after packing. This evidence is committed separately and is excluded from the
package. The historical [1.1.1 evidence](release-1.1.1-validation.md) describes the
previous release preparation, not the artifact to publish for this Issue.

## Successful validation

All required checks exited successfully:

- `npm run build-uglify`
- `npm run typecheck`
- `npm run test:offline`
- `npm test`
- `npm run test:package`
- `npm run test:package -- /private/var/folders/_t/12j6tqzx6wv4z2l__ttncdxc0000gn/T/mmd-parser-1.1.2-release-rp2awjtf/mmd-parser-1.1.2.tgz`
- `git diff --check`

Dependencies were installed with
`npm install --no-package-lock --no-audit --no-fund`. Dependency ranges were
unchanged and no lockfile was added. Rebuilding reproduced all tracked runtime
bundles and declarations without changes. Rollup emitted its existing top-level
`this` warnings and UglifyJS emitted constant-condition warnings; the build
completed successfully. Release preparation made no parser source, API, or
runtime behavior changes.

Offline PMD/PMX/VMD/VPD assertions passed across the UMD, minified UMD, browser
ES module, and native ESM bundles, plus the browser global smoke check. The
additional UV regression coverage passed for morph types 4–7, 1-, 2-, and 4-byte
vertex indices, and both coordinate modes. It checks both UV elements, unchanged
UV offsets, and alignment of the following vertex morph, display frame, rigid
body count, and constraint count.

The online smoke script downloaded and parsed all three samples: PMD
`format: 'pmd'` with `vertexCount: 12354`, VMD `motionCount: 14160`, and VPD
`boneCount: 93`. Its metadata output was inspected; it has no assertions and
does not exercise PMX.

Both package checks installed outside the repository and passed CommonJS and
native Node ESM package-root exports and PMD/PMX/VMD/VPD parsing. Both runtime
consumers additionally asserted the PMX additional UV regression matrix above
against the installed package. Strict TypeScript contracts passed with legacy
Node, Node16, NodeNext, and bundler resolution, including CommonJS and ESM
consumers. The retained tarball itself was used for the explicit consumer check.

## Retained artifact and contents

Created with `npm pack --json --pack-destination <retained directory>` after the
source commit above. The artifact is outside the repository. Preserve or copy
its containing directory to durable storage before temporary-directory cleanup.
Its sibling `SHA256SUMS` and `pack.json` retain the checksum and npm pack metadata.
If relocated, update the publish path below and preserve these exact bytes.

- Path: `/private/var/folders/_t/12j6tqzx6wv4z2l__ttncdxc0000gn/T/mmd-parser-1.1.2-release-rp2awjtf/mmd-parser-1.1.2.tgz`
- Size: 225067 bytes
- SHA-256: `a154ec56e17809f790919d0a5e7dfd56c42c3d36339312100c3f1d3fb5062c14`
- npm integrity: `sha512-ZdG6bT0kZYz7SM/rPn6Um/Qm7PoYtxckTn6l0qNHljgD25pt0vyIf9QSeezJb7TillsKG2fGZ80Ojfv6jC+uwA==`
- npm shasum: `68a8eb663e275a568e8be0982f656759e8affa30`

`shasum -a 256 -c SHA256SUMS` passed. The npm SHA-1 shasum and SHA-512 integrity
were independently recomputed from the retained tarball and matched `pack.json`.
`tar -tzf` and the installed-file allowlist confirmed exactly these 15 files:

```text
LICENSE
Readme.md
build/mmdparser.js
build/mmdparser.min.js
build/mmdparser.module.js
build/mmdparser.module.mjs
build/types/index.d.mts
build/types/index.d.ts
build/types/src/charset-encoder-js.d.ts
build/types/src/CharsetEncoder.d.ts
build/types/src/DataCreationHelper.d.ts
build/types/src/DataViewEx.d.ts
build/types/src/Parser.d.ts
build/types/src/Types.d.ts
package.json
```

No implementation source, tests, scripts, release documentation, repository
files, intermediate build output, or authentication files are distributed.

## Exact manual publish command after merge

The maintainer can publish the validated tarball after merge, authenticating
with npm if needed as described in the [release guide](releases.md):

```sh
npm publish "/private/var/folders/_t/12j6tqzx6wv4z2l__ttncdxc0000gn/T/mmd-parser-1.1.2-release-rp2awjtf/mmd-parser-1.1.2.tgz" --access public --tag latest --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org
```

Publication was not performed. No npm login, credentials, project authentication
files, registry release verification, release tags, pushes, or GitHub comments
were needed or performed. Required post-merge verification for Issue completion:
**None**. The release guide documents separate maintainer-only authentication,
version-availability checking, publication, registry artifact and `latest`
verification, then creation/push of `v1.1.2` only after publication and registry
verification succeed. Those actions do not block pre-merge approval or Issue
completion.
