import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moves the datasource URL out of schema.prisma into here.
// Next.js keeps secrets in .env.local, so load that for the Prisma CLI
// (which otherwise only reads .env).
//
// Pick the env file by intent: `db:deploy:prod` sets PRISMA_ENV=production to
// load production credentials (point DATABASE_URL there at the DIRECT/unpooled
// endpoint — migrations need it). Everything else uses the local dev DB, so a
// normal `prisma migrate dev` can never accidentally run against production.
config({
  path: process.env.PRISMA_ENV === "production" ? ".env.production.local" : ".env.local",
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
