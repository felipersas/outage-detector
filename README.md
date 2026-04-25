# Outage Detector

A serverless website monitoring platform built on AWS using [SST v4](https://sst.dev/). Monitors URLs for outages in real-time and sends instant alerts via Telegram when a site goes down or recovers.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│  API Gateway │────▶│   Lambda     │
│   Frontend   │     │    (HTTP)    │     │  Functions   │
└─────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                                    ┌────▼─────┐
  ┌────▼─────┐                          ┌───│ DynamoDB │───┐
  │  Cognito │                          │   └──────────┘   │
  │  Auth    │                     ┌────▼────┐       ┌────▼────┐
  └──────────┘                     │OutageTable│     │UsersTable│
                                   └─────────┘     └─────────┘
       ┌──────────────────────────────────────────────────┐
       │                   Event Flow                       │
       │  Cron (1min) ──▶ check-outages ──▶ SNS ──▶ notify │
       └──────────────────────────────────────────────────┘
```

## Tech Stack

- **Infrastructure:** SST v4, AWS Lambda, API Gateway v2, CloudWatch Events (EventBridge)
- **Storage:** DynamoDB (OutageTable, UsersTable)
- **Messaging:** Amazon SNS (AlertTopic)
- **Auth:** Amazon Cognito UserPool
- **Frontend:** Next.js 15 (App Router), shadcn/ui, Tailwind CSS
- **Notifications:** Telegram Bot API
- **Language:** TypeScript

## Features

- **Real-time monitoring** — Cron-based Lambda checks monitored URLs every minute
- **Instant alerts** — Telegram notifications on status changes (up→down, down→up)
- **Smart re-notification** — Re-notifies every 30 minutes for ongoing outages
- **Concurrent checks** — Up to 10 URLs checked simultaneously with 10s timeout per URL
- **Dashboard** — Web UI with Cognito authentication to manage monitored URLs
- **Telegram Bot** — Register and manage monitoring directly from Telegram

## Project Structure

```
outage-detector/
├── backend/
│   ├── functions/
│   │   ├── check-outages.ts      # Cron job — checks all URLs every minute
│   │   ├── create-url.ts         # API — add URL to monitoring
│   │   ├── delete-url.ts         # API — remove URL from monitoring
│   │   ├── get-urls.ts           # API — list monitored URLs
│   │   ├── notify-user.ts        # SNS consumer — sends Telegram alerts
│   │   ├── register-telegram.ts  # API — link Telegram account
│   │   └── telegram-webhook.ts   # Webhook — handles Telegram bot commands
│   ├── infra/                    # Shared infrastructure constructs
│   └── lib/                      # Shared utilities
├── frontend/
│   └── app/
│       ├── auth/                 # Authentication pages
│       ├── dashboard/            # Monitoring dashboard
│       └── api/                  # Frontend API routes
├── scripts/                      # Deployment and utility scripts
└── sst.config.ts                 # SST infrastructure definition
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [SST CLI](https://sst.dev/docs/reference/cli/)

### Installation

```bash
# Clone the repository
git clone https://github.com/felipersas/outage-detector.git
cd outage-detector

# Install dependencies
npm install

# Deploy to AWS
npx sst deploy
```

### Environment Setup

Configure your Telegram Bot token and other secrets via SST:

```bash
npx sst secret set TelegramBotToken <your-bot-token>
```

## How It Works

1. **Add URLs** — Via the web dashboard or Telegram bot, add URLs you want to monitor
2. **Automated checks** — A CloudWatch cron triggers `check-outages` every minute to probe all registered URLs
3. **Status detection** — The checker tracks state transitions: `up→down` (new outage), `down→up` (recovery), `down→down` (re-notification every 30 min)
4. **Notifications** — Status changes publish to SNS, which triggers `notify-user` to send Telegram messages

## License

MIT
