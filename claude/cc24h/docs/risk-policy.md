# Risk Policy

## Directory Rules

| Pattern | Max Risk | Reason |
|---------|----------|--------|
| `src/auth/**` | L2 | Auth is sensitive |
| `src/payment/**` | L1 | Payment: read-only only |
| `migrations/**` | L1 | Migrations: read-only only |
| `.env*` | L1 | Secrets: read-only only |
| `tests/**` | L4 | Tests: allow all skill levels |
| `docs/**` | L3 | Docs: allow writes |

## Task Tag Rules

| Tag | Max Risk | Reason |
|-----|----------|--------|
| refactor | L3 | Limit refactor scope |
| hotfix | L2 | Hotfixes need human review |

## Auto-governance Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Fail rate | > 50% | Flag for disable |
| Unused days | > 30 | Flag for deprecation |
| Min uses before promotion | 3 | Block promotion |
| Max concurrent trials | 2 | Queue excess |

## Configuration

Edit `.cc24h/risk-policy.yaml` to customize rules per project.
