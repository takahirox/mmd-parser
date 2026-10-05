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

1. Read the Issue, repository instructions, and relevant source and tests. Work
   from the selected upstream commit; for a manual contribution, start from
   current `master` on a working branch.
2. Keep changes within the Issue. The public exports are in `index.ts`; parser
   code is in `src/`, distributed bundles in `build/`, the existing test script in
   `test/index.js`, and browser usage in `index.html` and `Readme.md`.
3. For parser changes, consider affected PMD, PMX, VMD, and VPD behavior, character
   decoding, coordinate conversion, and public API compatibility as applicable.
   Add focused regression coverage when needed to demonstrate the fix.
4. Inspect the diff for unrelated files and generated changes. Do not upgrade
   dependencies or change CI/deployment infrastructure as incidental work.
   Documentation-only tasks should stay within templates and documentation.

## Build and validate

Install existing dependencies with `npm install`, as documented in
[Readme.md](../Readme.md). Keep incidental installation artifacts out of the
change unless they are explicitly in scope. The scripts in
[package.json](../package.json) are:

| Command | Behavior |
| --- | --- |
| `npm run build` | Compiles strict TypeScript from `index.ts` and `src/` into ignored `.typescript-tmp/compiled/`, runs Rollup to produce `build/mmdparser.js` (UMD) and `build/mmdparser.module.js` (ES module), and writes public declarations to `build/types/`. |
| `npm run build-uglify` | Runs `build`, then UglifyJS to produce `build/mmdparser.min.js`. |
| `npm test` | Runs `node test/index.js` against `build/mmdparser.js`. |
| `npm run typecheck` | Checks the source under `strict` and `noUncheckedIndexedAccess`, then compile-only contracts against the generated public declarations. Rebuild after source changes. |
| `npm run test:offline` | Runs assertions using local PMD/PMX/VMD/VPD fixtures against the UMD, minified UMD, and ES module bundles, plus a browser global smoke check. |
| `npm run all` | Runs `build-uglify`, `typecheck`, `test:offline`, and the network-dependent `test` in sequence. |
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

The current test script downloads PMD, VMD, and VPD samples from external
`raw.githubusercontent.com` URLs pinned to Three.js r171 commit
`2898f5b1ba10b1e94174c0a62d072f5f7b80442c` and logs parsed metadata; it has no
assertions and does not exercise PMX. Inspect output to confirm samples actually
loaded and parsed. An exit code alone does not demonstrate parser correctness.
Report download failures or missing coverage accurately, and use focused checks
with shareable inputs when needed for the Issue. Do not silently treat
unavailable samples as passing tests.

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

Follow the [review guidelines](review-guidelines.md). Review the exact PR head,
confirm applicable pre-merge checks and a clean merge into current `master`, and
approve when the implementation and those checks are sufficient. Recheck changed
code and affected validation if the head changes before merge. Merge only when
authorized by the task or workflow and applicable repository requirements allow it.

In the current ProjectWeave flow, the publication node adds `Closes #N` to the PR,
and the merge/close nodes close the source Issue. Preserve that closing reference.
Do not remove it or require the source Issue to remain open until all post-merge
checks are recorded: this conflicts with publication and can cause a
`Review -> Fix -> Publish -> Review` loop.

When post-merge verification is needed, record its outcome in the agreed location,
such as the merged PR or a follow-up Issue; the source Issue can already be closed.
If work requires a different Issue lifecycle, explicitly agree and update that
workflow rather than introducing contradictory template or review requirements.
