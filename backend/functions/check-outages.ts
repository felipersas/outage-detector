import { PublishCommand } from "@aws-sdk/client-sns";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { docClient } from "../infra/ddb";
import { snsClient } from "../infra/sns";
import type { OutageAlert, UrlItem } from "../lib/types";

const CHECK_CONCURRENCY = 10;

/** Intervalo mínimo entre re-notificações para a mesma URL (em ms) */
const RENOTIFY_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

export const handler = async () => {
  console.log("Checking for outages...");

  const upUrls = await queryAllByStatus("up");
  const downUrls = await queryAllByStatus("down");
  const allUrls = [...upUrls, ...downUrls];

  // Processa em batches para não sobrecarregar a rede
  for (let i = 0; i < allUrls.length; i += CHECK_CONCURRENCY) {
    const batch = allUrls.slice(i, i + CHECK_CONCURRENCY);
    await Promise.allSettled(batch.map((item) => checkUrl(item)));
  }
};

// ─── Query com paginação automática ──────────────────────────────────────────

async function queryAllByStatus(status: "up" | "down"): Promise<UrlItem[]> {
  const items: UrlItem[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: Resource.OutageTable.name,
        IndexName: "ByStatus",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": status },
        ExclusiveStartKey: lastKey,
      }),
    );

    items.push(...((result.Items as UrlItem[]) ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

// ─── Check individual ────────────────────────────────────────────────────────

async function checkUrl(item: UrlItem): Promise<void> {
  const { id, userId, url, status: previousStatus } = item;
  const now = new Date().toISOString();

  let isUp: boolean;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    isUp = response.ok;
  } catch {
    isUp = false;
  }

  const newStatus = isUp ? "up" : "down";

  // Detecta transição de estado
  if (previousStatus === "up" && !isUp) {
    // ── Outage detectado ──
    console.error(`Outage detected for ${url}`);
    await updateStatus(id, userId, "down", now, now);
    await publishAlert({ type: "outage", url, userId, timestamp: now });
    return;
  }

  if (previousStatus === "down" && isUp) {
    // ── Recovery detectado ──
    console.log(`Recovery detected for ${url}`);
    await updateStatus(id, userId, "up", now, now);
    await publishAlert({ type: "recovery", url, userId, timestamp: now });
    return;
  }

  if (previousStatus === "down" && !isUp) {
    // ── Ainda down — re-notifica se passou o intervalo ──
    if (shouldRenotify(item.lastNotifiedAt)) {
      console.warn(`Re-notifying outage for ${url}`);
      await updateStatus(id, userId, "down", now, now);
      await publishAlert({ type: "outage", url, userId, timestamp: now });
      return;
    }
  }

  // Sem mudança de estado — só atualiza lastChecked
  await updateStatus(id, userId, newStatus, now);
}

function shouldRenotify(lastNotifiedAt?: string): boolean {
  if (!lastNotifiedAt) return true;
  return Date.now() - new Date(lastNotifiedAt).getTime() > RENOTIFY_INTERVAL_MS;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function updateStatus(
  id: string,
  userId: string,
  status: "up" | "down",
  lastChecked: string,
  lastNotifiedAt?: string,
): Promise<void> {
  let updateExpr = "SET #status = :status, lastChecked = :lastChecked";
  const exprValues: Record<string, unknown> = {
    ":status": status,
    ":lastChecked": lastChecked,
  };

  if (lastNotifiedAt) {
    updateExpr += ", lastNotifiedAt = :lastNotifiedAt";
    exprValues[":lastNotifiedAt"] = lastNotifiedAt;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: Resource.OutageTable.name,
      Key: { id, userId },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: exprValues,
    }),
  );
}

async function publishAlert(alert: OutageAlert): Promise<void> {
  await snsClient.send(
    new PublishCommand({
      TopicArn: Resource.AlertTopic.arn,
      Message: JSON.stringify(alert),
    }),
  );
}