---
description: How to check-in and push code to GitHub
---

When the user asks to check-in, commit, or push code to GitHub:

1. **Locate Artifacts**: Find the `implementation_plan.md` and `walkthrough.md` files from the current conversation's artifact directory (usually located in `<appDataDir>/brain/<conversation-id>/`).
2. **Create Documentation Folder**: Create a new directory in the workspace under `docs/history/YYYY-MM-DD_<brief-feature-name>/`.
3. **Copy Documentation**: Copy the `implementation_plan.md` and `walkthrough.md` (and any associated media/images referenced in the walkthrough) into the newly created folder. Update the image paths in the copied markdown files so they point to the relative paths in the repo.
4. **Stage Changes**: Run `git add .` to stage all modified code and the new documentation files.
5. **Commit**: Run `git commit -m "<Commit message>"` with a descriptive message of the feature or bug fix.
6. **Push**: Run `git push` to push the commit to GitHub.

By following this workflow exactly, we ensure that every significant check-in retains a persistent historical record of the planning and walkthrough artifacts alongside the code!
