import { TelegramSetup } from "@/components/telegram-setup";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your notification preferences.
        </p>
      </div>

      <TelegramSetup />
    </div>
  );
}
