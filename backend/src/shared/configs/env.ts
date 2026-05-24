import dotenvFlow from "dotenv-flow";
import { z } from "zod";

dotenvFlow.config();

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z
    .union([z.string(), z.number()])
    .default(9000)
    .transform(v => (typeof v === "string" ? parseInt(v, 10) : v)),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),

  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL")
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // pino is not yet initialised at boot; console.error is the right channel here.
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment configuration:");
  result.error.issues.forEach(issue => {
    // eslint-disable-next-line no-console
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env: Readonly<Env> = Object.freeze(result.data);

export default env;
