import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    appsScriptUrl: process.env.APPS_SCRIPT_URL
      ? `SET (starts with: ${process.env.APPS_SCRIPT_URL.slice(0, 40)}…)`
      : 'NOT SET',
    webhookSecret: process.env.WEBHOOK_SECRET ? 'SET' : 'NOT SET',
  });
}
