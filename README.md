# Sero — Web

Landing + quiz + URLs personalizadas + story de IG generada por servidor +
mensaje WhatsApp pre-rellenado. Next.js 14 / TypeScript / Tailwind, optimizado
para Vercel.

## Decisiones que ya están tomadas

- **Stack:** Next.js 14 (App Router) + TS + Tailwind. Cero costo en Vercel.
- **Storage:** Google Sheet vía Apps Script (cero costo, vos lees y armas los
  grupos de 5 a mano).
- **Slug:** `nombre-apellido`. Si choca, el Apps Script agrega `-2`, `-3`...
- **Imagen IG:** 1080×1920 generada por `next/og` (edge runtime), con los
  títulos específicos del usuario como pills.
- **Fuente:** Sora (Google Fonts).
- **Paleta:** coral `#E06A5F`, púrpura `#4D314D`, cream `#F6F1E8`, ink `#292726`,
  sand `#D9CFC2`.

## Local

```bash
npm install
npm run dev      # → http://localhost:3000
```

Sin `APPS_SCRIPT_URL`, las submissions se loguean a la consola y los slugs
no se persisten — útil para iterar el quiz sin tocar el Sheet.

## Conectar el Google Sheet (10 min, una sola vez)

1. Crea un Sheet nuevo. Nómbralo "Sero Quiz Responses".
2. Menú: **Extensions → Apps Script**.
3. Pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs) en `Code.gs`.
4. (Opcional pero recomendado) **Project Settings → Script Properties → Add:**
   - key: `WEBHOOK_SECRET`
   - value: cualquier string largo aleatorio
5. **Deploy → New deployment → Type: Web app.**
   - Execute as: Me
   - Who has access: Anyone
6. Copia la **Web app URL** (`https://script.google.com/macros/s/.../exec`).
7. En Vercel (Settings → Environment Variables):
   - `APPS_SCRIPT_URL` = la URL del paso 6.
   - `WEBHOOK_SECRET` = el mismo string del paso 4 (si lo pusiste).
   - `NEXT_PUBLIC_SITE_URL` = tu dominio final (ej. `https://sero.app`).
8. Redeploy.

## Cómo leer el Sheet para armar tablas de 5

Cada submission crea una fila con: timestamp, slug, **referredBy** (slug del
amigo que invitó), nombre, gustos por mundo en texto libre, y `rawJson`
(payload completo por si quieres parsear).

- `referredBy` te conecta los grafos: filtra por `referredBy = "ariadna-alfaro"`
  para ver a quién invitó Ariadna.
- Para armar grupos de 5: ordena por gustos compartidos (música/series/etc.) y
  agrupa manualmente. Cuando tengas señal del MVP construimos el matcher.

## Deploy a Vercel

```bash
# Una sola vez
npx vercel link

# Deploy de producción
npx vercel --prod
```

Configurá el dominio en Vercel (Project → Settings → Domains).

## Estructura

```
app/
  page.tsx                  # Landing
  quiz/page.tsx             # Quiz
  [slug]/page.tsx           # Link personalizado (Te invitó X)
  api/
    submit/route.ts         # POST quiz → Apps Script
    og/[slug]/route.tsx     # 1080x1920 IG story (next/og)
components/
  landing/                  # Section1Hero … Section6Final
  quiz/                     # Quiz, ProgressBar, ShareScreen
  ui/Logo.tsx
lib/
  types.ts worlds.ts slug.ts humanize.ts extractTags.ts whatsapp.ts baseUrl.ts
apps-script/Code.gs
public/logo.png             # Tu logo
```

## Cosas pendientes para vos

- [ ] Reemplazar la foto stock de **Section 5** (`Section5Photo.tsx`) por la
      tuya: colócala en `public/section5.jpg` y cambia `STOCK_URL` por
      `"/section5.jpg"`.
- [ ] Confirmar dominio final y configurarlo en Vercel.
- [ ] Crear el Sheet y conectar el Apps Script (pasos arriba).
- [ ] Probar el flujo de invitación end-to-end con dos teléfonos.
