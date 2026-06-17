import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moves the datasource URL out of schema.prisma into here.
// Next.js keeps secrets in .env.local, so load that for the Prisma CLI
// (which otherwise only reads .env).
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
