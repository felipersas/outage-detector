import TelegramSetup from "@/components/telegram-setup";
import { getIdToken } from "@/lib/session";
import { getUserIdFromToken } from "@/lib/jwt";

export default async function SettingsPage() {
  const idToken = await getIdToken();
  const userId = idToken ? getUserIdFromToken(idToken) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your notification preferences.
        </p>
      </div>

      <TelegramSetup userId={userId} />
    </div>
  );
}
