# Build and verification

Use the exact dependency versions in `package.json` with the committed lockfile. Run `pnpm check`, `pnpm build`, and `pnpm run audit` before handing changes off. The Worker dry-run validates the local ASSETS configuration; production deployment and formal browser verification remain separate steps.
