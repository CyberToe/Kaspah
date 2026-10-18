# Security and confidentiality

- Repository must be **Private**. Never change visibility without the owner's approval.
- Never commit secrets (API keys, tokens, `.env`). Run `npm run leak-check` before every push.
- Report any suspected leak to the owner immediately and rotate affected credentials.
- Only code that already lives in this repository may be added to it. Anything kept outside
  it (front end, other engines, logs, datasets) must stay outside.
