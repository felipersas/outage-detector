#!/bin/bash
# Script to set up Telegram webhook
# Usage: ./scripts/setup-webhook.sh <bot-token> <webhook-url>

BOT_TOKEN=$1
WEBHOOK_URL=$2

if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Error: Bot token is required"
  echo "Usage: ./scripts/setup-webhook.sh <bot-token> <webhook-url>"
  echo "Example: ./scripts/setup-webhook.sh 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 https://api-id.execute-api.region.amazonaws.com/telegram-webhook"
  exit 1
fi

if [ -z "$WEBHOOK_URL" ]; then
  echo "❌ Error: Webhook URL is required"
  echo "Usage: ./scripts/setup-webhook.sh <bot-token> <webhook-url>"
  echo "Example: ./scripts/setup-webhook.sh 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11 https://api-id.execute-api.region.amazonaws.com/telegram-webhook"
  exit 1
fi

echo "📡 Setting up Telegram webhook..."
echo "Webhook URL: $WEBHOOK_URL"

# Delete existing webhook
echo ""
echo "🗑️ Deleting existing webhook..."
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook" -s | jq .

# Get current webhook info
echo ""
echo "📋 Current webhook info:"
curl -X GET "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" -s | jq .

# Set new webhook
echo ""
echo "🔗 Setting new webhook..."
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" -d "url=${WEBHOOK_URL}" -s | jq .

# Verify new webhook
echo ""
echo "✨ New webhook info:"
curl -X GET "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" -s | jq .

echo ""
echo "✅ Done!"
