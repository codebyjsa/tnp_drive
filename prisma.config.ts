import "dotenv/config";
import { defineConfig } from "@prisma/config";

const dbUrl = process.env.DATABASE_URL || process.env.tnp_DATABASE_URL || "";

export default defineConfig({
  datasource: {
    url: dbUrl,
  },
});
