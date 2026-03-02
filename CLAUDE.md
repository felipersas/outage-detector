# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AWS-based outage monitoring service built with SST v4. Users can register URLs to monitor, receive Telegram notifications when outages occur, and manage their monitored URLs through a Next.js dashboard.

**Tech Stack:**
- **Infrastructure:** SST v4 on AWS (serverless)
- **Backend:** AWS Lambda with AWS SDK v3 (DynamoDB, SNS, Cognito)
- **Frontend:** Next.js 15 with App Router
- **Auth:** AWS Cognito (email-based)
- **Notifications:** Telegram Bot API
- **Database:** DynamoDB (OutageTable, UsersTable)

## Architecture

### Backend Functions ([backend/functions/](backend/functions/))

All Lambda handlers follow the pattern: `export const handler = async (event: APIGatewayProxyEventV2) => ...`

| Function | Route | Purpose | Auth |
|----------|-------|---------|------|
| `create-url.ts` | `POST /urls` | Add URL to monitor | JWT |
| `get-urls.ts` | `GET /urls` | List user's URLs | JWT |
| `delete-url.ts` | `DELETE /urls/{id}` | Remove monitored URL | JWT |
| `register-telegram.ts` | `POST /register-telegram` | Link Telegram chat ID | JWT |
| `telegram-webhook.ts` | `POST /telegram-webhook` | Receive Telegram commands | Public |
| `check-outages.ts` | Cron (1 min) | Check all URLs, publish alerts | System |
| `notify-user.ts` | SNS subscriber | Send Telegram notifications | System |

### Infrastructure Resources ([sst.config.ts](sst.config.ts))

- **Cognito:** UserPool with email usernames, WebClient with USER_PASSWORD_AUTH flow
- **DynamoDB:**
  - `OutageTable`: Primary `(id, userId)`, GSI `byUser (userId, id)`, GSI `ByStatus (status, id)`
  - `UsersTable`: Primary `(userId)` - stores telegramChatId
- **SNS:** AlertTopic for async outage/recovery notifications
- **API Gateway V2:** JWT authorizer using Cognito tokens

### Frontend Architecture ([frontend/](frontend/))

- **Auth:** Cookie-based (id_token, refresh_token) stored via Next.js cookies API
- **Middleware:** [middleware.ts](frontend/middleware.ts) checks token expiration, redirects to signin
- **API Proxy:** Next.js API routes ([app/api/](frontend/app/api/)) proxy to backend via [proxyToBackend](frontend/lib/api-proxy.ts)
- **Cognito Direct:** [lib/cognito.ts](frontend/lib/cognito.ts) uses AWS SDK v3 for auth flows
- **State:** TanStack Query via [lib/actions/](frontend/lib/actions/) hooks

### Data Flow

1. **Outage Detection:** Cron triggers `check-outages` → fetches URLs → checks status → publishes to SNS
2. **Notification:** SNS triggers `notify-user` → queries UsersTable → sends Telegram message
3. **Telegram Setup:** User sends `/start` to bot → receives chat ID → registers via dashboard

## Commands

### SST Development
```bash
sst dev              # Start local dev environment
sst deploy           # Deploy to current stage
sst deploy --stage prod  # Deploy to production
sst console          # Open SST console
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Telegram Webhook Setup
```bash
./scripts/setup-webhook.sh <BOT_TOKEN> <WEBHOOK_URL>
```
Requires `jq` installed. The webhook URL is the API Gateway route output after deployment.

## SST Resource Links

Backend functions access linked resources via `Resource.<ResourceName>.<property>`:
- `Resource.OutageTable.name` — DynamoDB table name
- `Resource.UsersTable.name` — Users table name
- `Resource.AlertTopic.arn` — SNS topic ARN
- `Resource.TelegramBotToken.value` — Secret value (bot token)

Frontend accesses via `Resource.<ResourceName>.id`:
- `Resource.UserPool.id` — Cognito pool ID (format: `<region>_<pool-id>`)
- `Resource.WebClient.id` — Cognito client ID

## Database Operations

Use AWS SDK v3 DocumentClient ([backend/infra/ddb.ts](backend/infra/ddb.ts)):
```typescript
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../infra/ddb";

await docClient.send(new PutCommand({ TableName: Resource.OutageTable.name, Item: ... }));
await docClient.send(new QueryCommand({ TableName: Resource.OutageTable.name, ... }));
```

The DocumentClient auto-serializes/deserializes DynamoDB types.

## Authentication Patterns

### Backend (Protected Routes)
Extract userId from JWT authorizer claims ([backend/lib/auth.ts](backend/lib/auth.ts)):
```typescript
import { getUserId } from "../lib/auth";
const userId = getUserId(event); // throws if unauthorized
```

Use [ensureUserExists](backend/lib/user.ts) before creating resources for new users.

### Frontend
- **Sign up/in:** Direct Cognito calls via [lib/cognito.ts](frontend/lib/cognito.ts)
- **Authenticated requests:** Cookie automatically forwarded by [proxyToBackend](frontend/lib/api-proxy.ts)
- **Token refresh:** Handled by middleware on expiration

## Outage Checking Logic ([check-outages.ts](backend/functions/check-outages.ts))

- Runs every minute via `rate(1 minute)` cron
- Processes 10 URLs concurrently (CHECK_CONCURRENCY)
- Paginates through `ByStatus` GSI for all "up" and "down" items
- 10-second timeout per URL fetch
- Re-notifies outages every 30 minutes (RENOTIFY_INTERVAL_MS)
- Status transitions: `up→down` (outage alert), `down→up` (recovery alert), `down→down` (renotify if interval passed)

## Frontend File Structure

- [app/](frontend/app/) — Next.js App Router pages
- [components/](frontend/components/) — React components (UI via shadcn/ui)
- [lib/](frontend/lib/) — Utilities (cognito, api-client, api-proxy, actions, hooks, schemas)

## Notes

- Telegram bot token is stored as SST Secret, not in code
- CORS is enabled on API Gateway (`allowOrigins: ["*"]`)
- Cron function has 65-second timeout (exceeds 1-minute interval to complete)
- User must exist in UsersTable before creating URL entries (handled by ensureUserExists)
