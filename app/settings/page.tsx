// app/settings/page.tsx
// Settings: tone selector, clear chat, fallback webhook input, and short env explanation.

"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Tone, Density } from "@/lib/types";

export default function SettingsPage() {
  const { tone, setTone, name, setName, profileNotes, setProfileNotes, clearMessages, fallbackWebhook, setFallbackWebhook, notificationsWebhook, setNotificationsWebhook, theme, setTheme, loadSettings, saveSettings, hideSleepingHours, sleepStartHour, sleepEndHour, setHideSleepingHours, setSleepStartHour, setSleepEndHour, density, setDensity, autoRefreshEnabled, autoRefreshIntervalSec, setAutoRefreshEnabled, setAutoRefreshIntervalSec } = useAppStore();
  const [testWebhook, setTestWebhook] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<null | "ok" | "err">(null);

  useEffect(() => {
    // Load from Neon on first render
    loadSettings();
  }, [loadSettings]);

  async function testWebhookCall() {
    if (!testWebhook.trim()) return;
    try {
      await fetch(testWebhook.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true, ts: Date.now() }),
      });
      alert("Webhook pinged (check your n8n)");
    } catch {
      alert("Webhook test failed (likely CORS or invalid URL)");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={async () => {
            setSaving(true);
            const ok = await saveSettings();
            setSaving(false);
            setSaveResult(ok ? "ok" : "err");
            setTimeout(() => setSaveResult(null), 2000);
          }}
          className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saveResult === "ok" && <span className="text-xs text-green-600">Saved</span>}
        {saveResult === "err" && <span className="text-xs text-red-600">Failed to save</span>}
      </div>

      <section className="space-y-2">
        <h2 className="font-medium">Profile</h2>
        <label className="text-sm flex items-center gap-2">
          <span>Preferred Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Alex"
            className="border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          />
        </label>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">What does Eeko need to know about you?</label>
          <textarea
            value={profileNotes}
            onChange={(e) => setProfileNotes(e.target.value)}
            placeholder="Freeform notes for personalization (e.g., goals, constraints, routines, sensitivities)."
            rows={4}
            className="w-full max-w-xl border rounded px-2 py-2 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Saved locally via your settings backend. Avoid adding secrets.</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Appearance</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
            />
            <span>Dark mode</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span>Density</span>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as Density)}
              className="border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
              <option value="ultra">Ultra</option>
            </select>
          </label>
          <span className="text-xs text-gray-500">Choose how dense the UI appears across all pages.</span>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Auto Refresh (Chat)</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
            />
            <span>Enable auto refresh</span>
          </label>
          <label className="text-sm flex items-center gap-2">
            <span>Interval (sec)</span>
            <input
              type="number"
              min={2}
              max={60}
              value={autoRefreshIntervalSec}
              onChange={(e) => setAutoRefreshIntervalSec(Number(e.target.value))}
              className="w-24 border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </label>
          <span className="text-xs text-gray-500">Default is 7 seconds. Auto-pauses while typing.</span>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Sleeping Hours (Schedule)</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hideSleepingHours}
            onChange={(e) => setHideSleepingHours(e.target.checked)}
          />
          <span>Hide sleeping hours in 24-hour schedule grid</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <span>Sleep start hour</span>
            <input
              type="number"
              min={0}
              max={23}
              value={sleepStartHour}
              onChange={(e) => setSleepStartHour(Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </label>
          <label className="text-sm flex items-center gap-2">
            <span>Sleep end hour</span>
            <input
              type="number"
              min={0}
              max={23}
              value={sleepEndHour}
              onChange={(e) => setSleepEndHour(Number(e.target.value))}
              className="w-20 border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
          </label>
          <span className="text-xs text-gray-500">Hours are 0–23. Window may cross midnight (e.g., 22 → 8).</span>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Tone</h2>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          className="border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        >
          <option>Gentle</option>
          <option>Strict</option>
          <option>Playful</option>
          <option>Neutral</option>
        </select>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Chat History</h2>
        <button
          onClick={clearMessages}
          className="px-3 py-1.5 rounded bg-white border hover:bg-gray-50 text-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Clear chat history
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Fallback n8n Webhook</h2>
        <input
          className="border rounded px-2 py-1 w-full max-w-xl bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="https://... (optional, else local mock used)"
          value={fallbackWebhook}
          onChange={(e) => setFallbackWebhook(e.target.value)}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Notifications Webhook</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Used for evaluation pings (e.g., after the 5-minute timer in Impulse Control).</p>
        <input
          className="border rounded px-2 py-1 w-full max-w-xl bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="https://your-service/webhook/notify"
          value={notificationsWebhook || ''}
          onChange={(e) => setNotificationsWebhook(e.target.value)}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Debug webhook test</h2>
        <div className="flex gap-2">
          <input
            className="border rounded px-2 py-1 flex-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="https://your-n8n-host/webhook/test"
            value={testWebhook}
            onChange={(e) => setTestWebhook(e.target.value)}
          />
          <button onClick={testWebhookCall} className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm dark:bg-gray-100 dark:text-gray-900">
            Send test
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Environment variables required later: NEXT_PUBLIC_FALLBACK_WEBHOOK, GPT key, Pushcut token. Do not commit secrets.
        </p>
      </section>
    </div>
  );
}
