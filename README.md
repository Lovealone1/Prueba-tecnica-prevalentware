# Prueba técnica Prevalentware

Aplicación web construida con **Next.js**, **Prisma** y **Supabase**, con autenticación mediante **Better Auth** y GitHub OAuth.

## Requisitos

- Node.js 20+
- npm (o el gestor de paquetes de tu preferencia)
- Una base de datos Postgres (local, Supabase, Neon, Vercel Postgres, etc.)
- Credenciales de GitHub OAuth (si vas a usar login con GitHub)

## Configuración de entorno

Crea un archivo `.env.local` en la raíz con las siguientes variables:

```bash
# Base de datos (Postgres)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="tu-secreto"

# GitHub OAuth
GITHUB_CLIENT_ID="tu-client-id"
GITHUB_CLIENT_SECRET="tu-client-secret"

# Supabase (cliente)
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
```

> Nota: si despliegas en un dominio distinto, ajusta `BETTER_AUTH_URL` y revisa `trustedOrigins` en `src/server/auth/auth.ts`.

## Ejecutar el proyecto localmente

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Ejecuta migraciones de Prisma:
   ```bash
   npx prisma migrate dev
   ```

3. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Crea un proyecto en Vercel e importa este repositorio.
2. En **Project Settings → Environment Variables**, agrega todas las variables de `.env.local`.
3. Asegúrate de que `BETTER_AUTH_URL` apunte al dominio final de Vercel (por ejemplo, `https://tu-app.vercel.app`).
4. (Recomendado) Configura el **Build Command** para aplicar migraciones antes del build:
   ```bash
   npx prisma migrate deploy && npm run build
   ```
5. Despliega el proyecto con el botón **Deploy**.

Después del despliegue, verifica que el callback de GitHub OAuth incluya el dominio de Vercel y que la base de datos sea accesible desde el entorno de producción.
