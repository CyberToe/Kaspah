# Contributing

This repository is private and confidential (see LICENSE and NOTICE.md).

## Setup (once, after cloning)

    git config core.hooksPath .githooks
    npm run prepush

The pre-push hook runs the leak check and the tests before every push.

## Workflow

1. Do not commit directly to `main`.
2. Create a branch: `git checkout -b feature/short-description`
3. Commit small, focused changes.
4. Push the branch and open a pull request.
5. The owner reviews and merges (squash).

## Rules

- No secrets, tokens, keys or `.env` files.
- No front-end files (`.html`), logs or personal data.
- Only add code that belongs in this repository. Do not copy code from other projects.
- Do not share this repository or its contents with third parties.
- Keep the `Copyright (c) 2026 Gatuno Productions` header in every source file.
