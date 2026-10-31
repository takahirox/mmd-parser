# Development flow

This guidance applies to contributors and AI agents working on mmd-parser. The
default branch is `master`. Start with the [Issue template](../.github/ISSUE_TEMPLATE/task.md),
use the [PR template](../.github/pull_request_template.md), and follow the
[review guidelines](review-guidelines.md) before merge.

## Define the Issue

Describe the problem, expected outcome, relevant scope, and concrete acceptance
criteria. Include reproduction steps and a minimal, shareable input for bugs.
An assignee or owner field is not required.

Make pre-merge criteria achievable and verifiable by an AI agent where practical.
Require human confirmation, physical-device testing, or external approval only
when necessary for the actual Issue, and specify the question or evidence needed.
If an external answer is necessary, ask a focused question instead of repeatedly
trying code changes that cannot resolve it.

Separate pre-merge acceptance from checks possible only after merge, such as a
merge-triggered deployment, published-site check, or release verification. Use
`None` for required post-merge verification when the change needs none. Do not add
routine human-only or post-merge checks to every Issue.

## Implement a focused change

1. Read the source Issue's problem, expected outcome, and acceptance criteria,
   repository instructions, and relevant source and tests. Work from the selected
   upstream commit; for a manual contribution, start from current `master` on a
   working branch.
2. Keep changes within the Issue. The public exports are in `index.ts`; parser
   code is in `src/`, distributed bundles in `build/`, offline tests in
   `test/offline.js`, optional sample checks in `test/index.js`, and browser usage
   in `index.html` and `Readme.md`.
3. For parser changes, consider affected PMD, PMX, VMD, and VPD behavior, character
   decoding, coordinate conversion, and public API compatibility as applicable.
   Add focused regression coverage when needed to demonstrate the fix.
4. Inspect the diff for unrelated files and generated changes. Do not upgrade
   dependencies or change CI/deployment infrastructure as incidental work.
   Documentation-only tasks should stay within templates and documentation.

Prefer the smallest coherent change and design that fully satisfies the source
Issue. Avoid overengineering: added complexity is not automatically beneficial,
even when it concerns a relevant feature. Follow appropriate existing
architectural conventions and explain necessary complexity in terms of the
actual Issue. Simplicity must not excuse omitted requirements, error handling,
or necessary regression coverage. Use the
[review guidelines](review-guidelines.md#review-the-implementation-and-evidence)
to check both missing work and unjustified scope or complexity.

## Test and CI performance principles

**Detect the required failures at the lightest appropriate layer, without
redundant execution.** Preserve required correctness, regression assertions, and
meaningful integration coverage when redistributing checks. This repository has
npm build/test scripts but no checked-in CI workflow or browser/renderer test
suite; the browser global smoke check runs in Node's VM. Apply these principles
to local validation and future test/CI work:

1. **Prefer the lightest meaningful layer.** Use small synthetic fixtures and
   focused assertions for parser calculations, branches, decoding, and coordinate
   conversion; use compile-only contracts for type behavior. Keep bundle and
   installed-package checks for distribution boundaries. Use real-model or real
   browser checks when the defect requires that environment. Add tests that catch
   a concrete defect rather than merely mirror the implementation.
2. **Choose combinations deliberately.** Cover distinct PMD/PMX/VMD/VPD paths,
   PMX variants, coordinate states, bundle formats, and module-resolution modes
   with representative cases. Exhaust combinations where interactions require
   them, without automatically multiplying every model, material, format, and
   environment. Preserve required regressions and meaningful boundary checks.
3. **Match validation to the change.** Follow [Build and validate](#build-and-validate)
   for mandatory pre-merge checks: Markdown/link/consistency checks for docs,
   rebuilt artifacts, type checks, and offline regressions for core/runtime
   changes, and package/lifecycle checks for releases. For browser-example/UI
   changes, check affected loading and messages in the relevant environment;
   future CI/build changes must validate affected scripts and artifacts. Use
   focused checks for fast feedback and the applicable full regression sequence
   before merge. Sample downloads remain optional. Publication and registry
   verification follow the separate [release procedure](releases.md); record
   genuinely post-merge-only work separately, with `None` when unnecessary.
4. **Reuse work and avoid duplicate execution.** Reuse completed builds and
   expensive fixtures/downloads only with keys that account for relevant inputs
   and tools, and isolate mutable state and temporary consumers. Currently
   `npm test` and `test:offline` run the same suite, so `npm run all` repeats it;
   publication also deliberately rebuilds through `prepack`. Keep the documented
   validation and lifecycle safeguards until separately scoped changes reconcile
   duplication. In future CI, avoid equivalent push/PR runs for one revision,
   cancel superseded work when safe, and preserve publication ordering. Measure
   resource use before increasing parallel workers for independent work.
5. **Review added confidence and cost together.** Identify the additional defect
   a test detects, whether existing coverage already detects it, and the execution
   and maintenance cost. Watch repeated compiler/browser setup, package installs,
   large model downloads, and growing cross-products; keep necessary assertions.
6. **Maintain an execution-time budget.** Normal validation/CI timing is currently
   unmeasured; no baseline or target is documented. Establish a repository-specific
   baseline and target from evidence during actual test/CI performance work, then
   monitor growth and investigate overruns. Distinguish elapsed feedback time,
   total runner/computation time, and queue time. Revisit structure and duplication
   while retaining required coverage. This guidance adds no timing merge gate or
   benchmarking requirement for documentation changes.

> Does this change provide sufficient confidence with the lightest appropriate
> validation, without redundant execution?

## Build and validate

Choose checks using the [test and CI performance principles](#test-and-ci-performance-principles)
and the change-specific requirements below.

Install existing dependencies with `npm install`, as documented in
[Readme.md](../Readme.md). Keep incidental installation artifacts out of the
change unless they are explicitly in scope. The scripts in
[package.json](../package.json) are:

| Command | Behavior |
| --- | --- |
| `npm run build` | Compiles strict TypeScript from `index.ts` and `src/` into ignored `.typescript-tmp/compiled/`, runs Rollup to produce `build/mmdparser.js` (UMD), `build/mmdparser.module.js` (browser ES module), and `build/mmdparser.module.mjs` (native ESM), and writes public declarations to `build/types/`. |
| `npm run build-uglify` | Runs `build`, then UglifyJS to produce `build/mmdparser.min.js`. |
| `npm run prepack` | Runs `build-uglify`; npm invokes it automatically before packing or publishing. |
| `npm run prepublishOnly` | Builds, type-checks, runs offline fixtures, and validates the installed package; npm invokes it automatically before publication, including `npm publish --dry-run`. |
| `npm test` | Runs the offline fixture suite, including PMX 2.0/2.1 float32 version regression checks. |
| `npm run test:samples` | Optionally runs `node test/index.js` against `build/mmdparser.js`, downloading external PMD/VMD/VPD samples. |
| `npm run typecheck` | Checks the source under `strict` and `noUncheckedIndexedAccess`, then compile-only contracts against the generated public declarations. Rebuild after source changes. |
| `npm run test:offline` | Runs assertions using local PMD/PMX/VMD/VPD fixtures against the UMD, minified UMD, browser ES module, and native ESM bundles, plus a browser global smoke check. |
| `npm run test:package` | Packs the completed build with lifecycle scripts disabled, inspects the npm package, installs it outside the repository, and checks CommonJS and native Node ESM exports and strict TypeScript imports using legacy, Node16, NodeNext, and bundler resolution from the package root. Requires a completed build; optionally accepts an existing tarball path after `--`. |
| `npm run all` | Runs `build-uglify`, `typecheck`, `test:offline`, and `test` in sequence without external sample downloads. |
| `npm run dev` | Watches TypeScript, rebuilding bundles and declarations after successful compilations; it is not a completed validation check. |

For source or distributed-bundle changes, run the applicable builds,
`npm run typecheck`, `npm run test:offline`, and `npm test`
(or `npm run all` for the full sequence). Tests read the built bundle, so rebuild
after editing source. Review regenerated bundles and include them when needed for
the change, since `package.json` points consumers to `build/`, including its
TypeScript declarations. The local `src/charset-encoder-js.d.ts` declaration
keeps the untyped charset dependency from propagating untyped values into source
or consumer declarations. Keep parser records complete at construction and
use fixed-length reader overloads rather than assertions for ordinary data.

The optional `npm run test:samples` script downloads PMD, VMD, and VPD samples from external
`raw.githubusercontent.com` URLs pinned to Three.js r171 commit
`2898f5b1ba10b1e94174c0a62d072f5f7b80442c` and logs parsed metadata; it has no
assertions and does not exercise PMX. Inspect output to confirm samples actually
loaded and parsed. An exit code alone does not demonstrate parser correctness.
Report download failures or missing coverage accurately, and use focused checks
with shareable inputs when needed for the Issue. Do not silently treat
unavailable samples as passing tests.

For release changes, also run `npm run test:package` after building and
`npm publish --dry-run` to exercise the publish lifecycle without uploading.
Follow the [release procedure](releases.md) for local validation before merge,
then maintainer-only `npm publish` from clean, updated `master`, with separate
authentication, registry verification, and tagging. These maintainer actions are
not required for Issue completion; no retained tarball is needed.

For documentation-only changes, check template front matter, Markdown syntax,
relative links, command names, and consistency across the templates and guides.
Run `git diff --check` for whitespace errors. New runtime tests and parser builds
are not required when runtime files are unaffected. Record why those checks were
not run. This repository has no lint script; do not invent a passed lint check.

## Prepare the PR

Explain the problem, resulting behavior, focused changes, validation actually
performed, and related Issues. Give evidence for applicable pre-merge criteria.
Report failed, skipped, and unperformed checks with reasons and remaining impact;
never claim success without evidence. Write concise commits describing the change
and its purpose, and reference the Issue.

Record genuinely necessary post-merge verification separately, including the
check, when it can run, and where results will be recorded. Pending post-merge
results are not a pre-merge approval condition; do not require completed PR
metadata or checkboxes for checks that cannot yet run.

## Review, merge, and Issue closure

Follow the [review guidelines](review-guidelines.md). Ask: **Does this PR completely
solve the Issue, without unnecessary scope or complexity?** Review the exact PR
head, confirm applicable pre-merge checks and a clean merge into current `master`,
and approve when the implementation and those checks are sufficient. Request
focused fixes for concrete omissions or unjustified additions, then review the
updated PR again. Optional improvements remain suggestions rather than new
acceptance criteria. Recheck changed code and affected validation if the head
changes before merge. Merge only when authorized by the task or workflow and
applicable repository requirements allow it.

In the current ProjectWeave flow, the publication node adds `Closes #N` to the PR,
and the merge/close nodes close the source Issue. Preserve that closing reference.
Do not remove it or require the source Issue to remain open until all post-merge
checks are recorded: this conflicts with publication and can cause a
`Review -> Fix -> Publish -> Review` loop.

When post-merge verification is needed, record its outcome in the agreed location,
such as the merged PR or a follow-up Issue; the source Issue can already be closed.
If work requires a different Issue lifecycle, explicitly agree and update that
workflow rather than introducing contradictory template or review requirements.
