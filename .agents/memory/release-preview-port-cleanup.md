---
name: Release preview port cleanup
description: A workspace-specific side effect of local release validation.
---

After running the release smoke, inspect the workspace configuration diff for an added temporary preview port and remove it if it was not intentionally configured.

**Why:** The release preview was stopped successfully, but its local port mapping remained in the workspace configuration. That unrelated configuration change should not accompany a production release.

**How to apply:** Check the diff after local release validation. If a temporary mapping remains, restore the prior configuration through the platform's validated configuration replacement path rather than directly editing the protected file.