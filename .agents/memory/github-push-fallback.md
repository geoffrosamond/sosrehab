---
name: GitHub push fallback
description: Preserving GitHub branch history when workspace Git credentials fail.
---

If command-line Git cannot authenticate but a GitHub integration is authorized, publish through GitHub's Git Data API using the current remote commit as parent. Compare the resulting tree hash with the verified local tree before updating the remote ref without force. Then fetch and merge the new remote commit into the local branch so future pushes remain fast-forwardable.

**Why:** Workspace Git credentials may be invalid even while the connected GitHub integration has push access; the API can transfer a verified project snapshot without overwriting remote history.

**How to apply:** Use only when ordinary push fails and the remote has been checked for divergence. Never extract connector credentials, and abort if the remote ref changes or the constructed tree does not match the intended local tree.