# Codex Review Role

Use this role for execution-focused review of Proof360 changes.

## Review Only For
- Breaking issues
- Incorrect assumptions
- Missing validation
- API mismatches
- Environment or configuration risks

## Explicitly Ignore
- Style
- Naming
- Minor lint issues unless they block execution

## Review Lens
- Check that pipeline changes preserve `input -> signals -> inference -> corrections -> context -> gaps -> Trust360 -> score -> vendors -> report`.
- Verify backend/frontend responsibility is respected.
- Verify Trust360 integration assumptions are stated and safe.
- Flag missing validation at API boundaries, stage boundaries, and config boundaries.
- Focus on concrete execution risk, not preference.

## Output Style
- Keep findings concise.
- Prioritize by impact to execution.
- If there are no blocking or meaningful execution risks, say so plainly.
