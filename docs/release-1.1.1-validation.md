# mmd-parser 1.1.1 preparation evidence

Historical record of the former retained-tarball workflow. Use the current
[release procedure](releases.md) for future releases; the paths and publication
commands below are historical evidence, not current release instructions.

Prepared for Issue [#15](https://github.com/takahirox/mmd-parser/issues/15) on
2026-10-06 with Node `24.12.0` and npm `11.6.2`. The source revision is the
preparation commit containing this record, based on
`91880eb1e8c7e02143bad574b11fd7ac4aa55e4f`. No packaged files changed after
packing; this evidence file and the release guide are excluded from the package.

## Validation

All commands exited successfully:

- `npm run build-uglify`
- `npm run typecheck`
- `npm run test:offline`
- `npm test`
- `npm run test:package`
- `npm run test:package -- <retained tarball below>`
- `git diff --check`

Rebuilding reproduced all tracked bundles and declarations without changes.
Rollup emitted its existing top-level `this` warnings, and UglifyJS emitted
constant-condition warnings; the build completed successfully. No source, public
API, dependency ranges, or runtime behavior changed.

Offline assertions passed for PMD/PMX/VMD/VPD across all four bundles and the
browser global. The online smoke output confirmed PMD `format: 'pmd'` with
`vertexCount: 12354`, VMD `motionCount: 14160`, and VPD `boneCount: 93`;
all three samples downloaded and parsed. This script logs metadata rather than
asserting results.

Both package checks installed outside the repository and passed CommonJS and
native Node ESM package-root runtime exports and PMD/PMX/VMD/VPD parsing.
Strict TypeScript contracts passed with legacy Node, Node16, NodeNext, and bundler
resolution, including CommonJS and ESM consumers. The installed file allowlist and
`tar -tzf` inspection confirmed exactly these 15 files:

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

## Retained artifact

The artifact is outside the repository. Preserve or copy its containing directory
to durable storage before temporary-directory cleanup. Its sibling `SHA256SUMS`
and `pack.json` record the checksum and npm pack metadata. If relocated, update
the path in the command below; preserve these exact bytes.

- Path: `/private/var/folders/_t/12j6tqzx6wv4z2l__ttncdxc0000gn/T/mmd-parser-1.1.1-release-acn7n1hl/mmd-parser-1.1.1.tgz`
- Size: 224926 bytes
- SHA-256: `69f8728ae22ec21f5b6878b0e32dce1405c67068788d47dd6d724d5ca7ff5b1d`
- npm integrity: `sha512-x1Y1iYYi26es0WfdHlSWmp6K5DR7aQrvRZv4nUz7hiDniRx3RCVzDZRQQpVimXI+A+J9YqLdUifiSHEUkLKVfg==`
- npm shasum: `c4314ad416627ae21e0a2ba683884d8799b4d35e`

A second `npm pack --json --pack-destination <another temporary directory>`
produced a byte-identical tarball. The retained artifact, rather than the second
copy, was used for the explicit tarball consumer check.

## Exact manual publish command after merge

The maintainer can run this command after merge, authenticating with npm if
needed as described in the [release guide](releases.md):

```sh
npm publish "/private/var/folders/_t/12j6tqzx6wv4z2l__ttncdxc0000gn/T/mmd-parser-1.1.1-release-acn7n1hl/mmd-parser-1.1.1.tgz" --access public --tag latest --userconfig "$HOME/.npmrc" --registry=https://registry.npmjs.org
```

Publication was not performed. No npm login, credentials, project authentication
files, registry release verification, release tags, pushes, or GitHub comments
were needed or performed. Required post-merge verification for Issue completion:
**None**. The release guide documents separate maintainer-only registry artifact
and `latest` verification, followed by creation/push of `v1.1.1` only after
successful publication and verification.
