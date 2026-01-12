# Workflow Factory

Deterministic GitHub Actions workflow compiler. Generate correct, minimal workflows from typed building blocks.

**No freeform YAML generation.** Every workflow is built from validated, tested blocks with proper secrets, permissions, and failure documentation.

## Live Recipes

Copy-paste ready workflows with required secrets and troubleshooting guides:

- [Next.js → Vercel](https://workflow-factory.dev/recipes/nextjs-vercel) - PR previews + production deploys
- [Node → Docker → GHCR](https://workflow-factory.dev/recipes/node-docker-ghcr) - Multi-platform buildx to GitHub Container Registry
- [Static → GitHub Pages](https://workflow-factory.dev/recipes/static-gh-pages) - Build and deploy static sites

More recipes coming: Cloudflare Pages, Netlify, AWS Lambda, npm publish, Flutter Android.

## Why This Exists

Most GitHub Actions examples online are:
- Outdated (pinned to old action versions)
- Missing permissions (fail silently or with confusing errors)
- Missing secrets documentation (you figure out what `VERCEL_TOKEN` means)
- Untested (copy-paste and pray)

Every recipe here:
- Uses pinned, current action versions
- Declares minimum required permissions
- Lists all secrets with setup instructions
- Includes common failure solutions
- Is generated from tested TypeScript blocks

## Architecture

```
packages/
├── blocks/      # Typed workflow blocks (checkout, setup-node, deploy-vercel, etc.)
├── generator/   # Recipe → YAML compiler
├── recipes/     # Recipe definitions
├── validate/    # YAML + secrets + permissions validation
└── tests/       # Snapshot tests (60 passing)

apps/
└── web/         # Next.js site at workflow-factory.dev
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm --filter web dev
```

## Adding a Recipe

1. Create recipe in `packages/recipes/src/`
2. Add required blocks to `packages/blocks/src/blocks/`
3. Run `pnpm test` - snapshots auto-generate
4. Commit and push - CI validates, Vercel deploys

## License

MIT
