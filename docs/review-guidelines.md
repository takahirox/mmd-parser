# Review guidelines

AI agents and human reviewers should follow this guide together with the
[development flow](development-flow.md) and [PR template](../.github/pull_request_template.md).
The default branch is `master`. Evaluate evidence for the current PR head rather
than assuming a previous review or a checked box proves the current change works.

## Review the implementation and evidence

1. Read the source Issue and PR description. Identify the problem, intended
   outcome, scope, pre-merge acceptance criteria, and any genuinely necessary
   post-merge verification. Do not invent routine human-only requirements.
2. Record the reviewed head commit and inspect the full diff. Check correctness,
   focused scope, regressions, compatibility, and unnecessary changes. For parser
   changes, inspect affected formats, decoding, coordinate conversion, public
   exports, and generated bundles as applicable. Check that documentation matches
   actual file names and commands.
3. Evaluate applicable automated checks for that head and validation reported in
   the PR. Use the build/test commands and limitations in the development flow.
   Verify the evidence, including test output; distinguish passed, failed,
   skipped, and unperformed checks. A documentation-only change needs template,
   Markdown, link, and consistency checks, not new runtime tests or parser builds.
   If a check cannot run, assess its impact and whether other evidence is enough.
4. Confirm the reviewed head merges cleanly into current `master` using current
   GitHub mergeability information or a local trial merge in a disposable
   worktree. Refresh unknown or stale mergeability before deciding. Report
   conflicts as actionable findings. Do not rely on mergeability for an older
   head or an outdated base. Before merge, recheck if the head or base changes.

## Classify findings and choose the outcome

For each material finding, give its location, impact, and concrete resolution or
verification. Distinguish these cases:

- **Agent-fixable:** a code or documentation defect, scope error, merge conflict,
  or missing applicable validation that an agent can address. Request focused
  changes and recheck the affected behavior after the fix.
- **Necessary external input:** an unresolved requirement, inaccessible evidence,
  or essential human/device/external confirmation. State the exact question or
  evidence needed and why it affects pre-merge acceptance. Pause the dependent
  decision while continuing unaffected review; do not repeatedly request code
  fixes for a condition that requires an external answer.
- **Post-merge verification:** a necessary check possible only after merge.
  Record the plan and later result separately. A pending deployment, published-site,
  or release check does not block pre-merge approval or require a completed PR
  metadata field or checkbox.

Approve when the implementation satisfies the Issue and applicable pre-merge
checks are sufficient. Request changes for material, agent-fixable blockers;
explain any necessary external blocker without presenting it as a code defect.
Optional improvements are suggestions, not new acceptance criteria. Report the
reviewed head, evidence, findings, decision, and any required post-merge plan so
the next workflow step can act on the result.

## Merge and closing references

Before an authorized merge, confirm that approval and applicable repository checks
still cover the current head and that it merges cleanly into current `master`.
If the head changes, review the new diff and affected checks before merging. Do
not merge based on stale approval or bypass repository requirements.

ProjectWeave publication adds `Closes #N`; its merge/close nodes close the source
Issue. Preserve this metadata. Do not request removal of `Closes #N`, require the
Issue to stay open, or withhold approval solely because necessary post-merge
verification is pending. Such requirements conflict with the existing flow and
can create a `Review -> Fix -> Publish -> Review` loop. A different lifecycle
requires an explicit workflow change, not an incidental review policy.

Record required post-merge outcomes in the agreed location, even if the source
Issue is closed. Record failures accurately and create follow-up work when
needed. When no post-merge verification is required, state `None`.
