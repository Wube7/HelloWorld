# Publish stable release v2.2.0

Deploy stable release v2.2.0, updating the project README features list, archiving the comprehensive release notes, and creating the official git tag on GitHub.

## User Review Required
Please review the stable release v2.2.0 documentation.

## Proposed Changes

### 1. Release Documentation (`docs/releases/`)
- Deployed `v2.2.0_release_notes.md` and `v2.2.0_release_notes_zh.md`.

### 2. Repository README (`README.md`)
- Update the features section to highlight the symmetric **Equation Decoder** (both Warm-up and active modes) and the robust **Host Sync Resilience**.
- Update version history with v2.2.0.

## Verification Plan

### Automated Git Tagging & Actions
- Commit documentation updates.
- Create git tag `v2.2.0` and push to origin.
- Verify GitHub Actions successfully triggers and completes stable deployment.
