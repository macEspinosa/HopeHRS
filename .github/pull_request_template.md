## What changed
- Added .github/pull_request_template.md with standard PR template structure
- Configured branch protection rules for main branch:
  - Require PR with minimum 2 approvals
  - Dismiss stale approvals on new commits
  - Block force pushes
  - Restrict branch deletion
- Configured branch protection rules for dev branch:
  - Require PR with minimum 1 approval
  - Dismiss stale approvals on new commits
  - Block force pushes
  - Restrict branch deletion

## Why it was needed
- To enforce code review process before merging changes
- To prevent direct pushes and force pushes to protected branches
- To standardize PR descriptions across the team
- To ensure at least one team member reviews dev changes and two review main changes
- To maintain code quality and catch issues before they reach production

## How to test
1. **Test PR template**: Create a new PR in this repo - the template should auto-populate with these three sections
2. **Test dev branch protection**: 
   - Try pushing directly to dev (should be blocked)
   - Try force pushing to dev (should be blocked)
   - Create PR to dev - verify 1 approval is required before merge button enables
3. **Test main branch protection**:
   - Create PR from dev → main - verify 2 approvals are required
   - Push new commit to an open PR - verify existing approvals become stale/dismissed
   - Try deleting main branch (should be blocked)
