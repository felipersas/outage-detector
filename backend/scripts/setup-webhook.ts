/**
 * Script to set up Telegram webhook
 * Usage: npx tsx backend/scripts/setup-webhook.ts <webhook-url>
 *
 * Example: npx tsx backend/scripts/setup-webhook.ts https://api-id.execute-api.region.amazonaws.com/telegram-webhook
 */

import { Resource } from "sst";
import { TelegramClient } from "../lib/telegram";

async function main() {
  const webhookUrl = process.argv[2];

  if (!webhookUrl) {
    console.error("❌ Error: Webhook URL is required");
    console.log("Usage: npx tsx backend/scripts/setup-webhook.ts <webhook-url>");
    process.exit(1);
  }

  console.log("📡 Setting up Telegram webhook...");
  console.log(`Webhook URL: ${webhookUrl}`);

  try {
    // First, delete any existing webhook
    console.log("\n🗑️ Deleting existing webhook...");
    await TelegramClient.deleteWebhook();
    console.log("✅ Existing webhook deleted");

    // Get current webhook info to verify
    const info = await TelegramClient.getWebhookInfo();
    console.log("\n📋 Current webhook info:", JSON.stringify(info, null, 2));

    // Set the new webhook
    console.log(`\n🔗 Setting new webhook to: ${webhookUrl}`);
    await TelegramClient.setWebhook(webhookUrl);
    console.log("✅ Webhook configured successfully!");

    // Verify the new webhook
    const newInfo = await TelegramClient.getWebhookInfo();
    console.log("\n✨ New webhook info:", JSON.stringify(newInfo, null, 2));
  } catch (error) {
    console.error("❌ Failed to setup webhook:", error);
    process.exit(1);
  }
}

main();
