// app/api/settings/route.ts
// Single-user Settings stored in Neon Postgres
// Fields: tone, fallback_webhook, theme. Uses a singleton row with id='singleton'

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

async function ensureTable() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    tone TEXT NOT NULL DEFAULT 'Gentle',
    fallback_webhook TEXT NOT NULL DEFAULT '',
    notifications_webhook TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'dark',
    hide_sleeping_hours BOOLEAN NOT NULL DEFAULT false,
    sleep_start_hour INTEGER NOT NULL DEFAULT 22,
    sleep_end_hour INTEGER NOT NULL DEFAULT 8,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    compact_mode BOOLEAN NOT NULL DEFAULT false,
    density TEXT NOT NULL DEFAULT 'comfortable'
  )`;
  // For older schemas, ensure new columns exist
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS notifications_webhook TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS hide_sleeping_hours BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS sleep_start_hour INTEGER NOT NULL DEFAULT 22`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS sleep_end_hour INTEGER NOT NULL DEFAULT 8`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS density TEXT NOT NULL DEFAULT 'comfortable'`;
  // Ensure singleton row exists
  await sql`INSERT INTO settings (id) VALUES ('singleton')
           ON CONFLICT (id) DO NOTHING`;
}

export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();
    const rows = await sql`SELECT tone, fallback_webhook, notifications_webhook, theme, hide_sleeping_hours, sleep_start_hour, sleep_end_hour, compact_mode, density FROM settings WHERE id = 'singleton'`;
    const row = rows[0] || { tone: 'Gentle', fallback_webhook: '', notifications_webhook: '', theme: 'dark', hide_sleeping_hours: false, sleep_start_hour: 22, sleep_end_hour: 8, compact_mode: false, density: 'comfortable' } as any;
    return NextResponse.json({ ok: true, settings: { tone: row.tone, fallbackWebhook: row.fallback_webhook, notificationsWebhook: row.notifications_webhook, theme: row.theme, hideSleepingHours: !!row.hide_sleeping_hours, sleepStartHour: Number(row.sleep_start_hour ?? 22), sleepEndHour: Number(row.sleep_end_hour ?? 8), compactMode: !!row.compact_mode, density: String(row.density || 'comfortable') } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "db error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const tone = body?.tone ?? undefined;
    const fallbackWebhook = body?.fallbackWebhook ?? undefined;
    const notificationsWebhook = body?.notificationsWebhook ?? undefined;
    const theme = body?.theme ?? undefined;
    const hideSleepingHours = typeof body?.hideSleepingHours === 'boolean' ? body.hideSleepingHours : undefined;
    const sleepStartHour = Number.isFinite(body?.sleepStartHour) ? Number(body.sleepStartHour) : undefined;
    const sleepEndHour = Number.isFinite(body?.sleepEndHour) ? Number(body.sleepEndHour) : undefined;
    const compactMode = typeof body?.compactMode === 'boolean' ? body.compactMode : undefined;
    const density = typeof body?.density === 'string' ? body.density : undefined;

    await ensureTable();
    const sql = getDb();
    // Upsert fields provided in body
    await sql`INSERT INTO settings (id, tone, fallback_webhook, notifications_webhook, theme, hide_sleeping_hours, sleep_start_hour, sleep_end_hour, compact_mode, density)
              VALUES ('singleton', ${tone ?? 'Gentle'}, ${fallbackWebhook ?? ''}, ${notificationsWebhook ?? ''}, ${theme ?? 'dark'}, ${hideSleepingHours ?? false}, ${sleepStartHour ?? 22}, ${sleepEndHour ?? 8}, ${compactMode ?? false}, ${density ?? 'comfortable'})
              ON CONFLICT (id) DO UPDATE SET
                tone = COALESCE(${tone}, settings.tone),
                fallback_webhook = COALESCE(${fallbackWebhook}, settings.fallback_webhook),
                notifications_webhook = COALESCE(${notificationsWebhook}, settings.notifications_webhook),
                theme = COALESCE(${theme}, settings.theme),
                hide_sleeping_hours = COALESCE(${hideSleepingHours}, settings.hide_sleeping_hours),
                sleep_start_hour = COALESCE(${sleepStartHour}, settings.sleep_start_hour),
                sleep_end_hour = COALESCE(${sleepEndHour}, settings.sleep_end_hour),
                compact_mode = COALESCE(${compactMode}, settings.compact_mode),
                density = COALESCE(${density}, settings.density),
                updated_at = NOW()`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "db error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
