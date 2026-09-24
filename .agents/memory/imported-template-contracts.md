---
name: Imported template contracts
description: How to keep imported platform-template checks reliable in this repository.
---

Imported platform-template tests may depend on host-only `.grok` skills, references, or generated environment files that are intentionally absent from the repository. Preserve coverage for executable application behavior, but do not make the repository test suite require those host documents.

**Why:** The import includes platform contract tests alongside application tests, and the ignored host metadata is not available in a normal checkout.

**How to apply:** When adding or repairing tests around platform helpers, use temporary fixture workspaces for generic behavior, treat an absent `.grok/app-env.json` according to the wrapper's documented default, and keep prose-only host contracts outside `npm test`.