import dotenvFlow from "dotenv-flow";
import { z } from "zod";

dotenvFlow.config();

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.string().regex(/^\d+$/, "PORT must be a number").transform(Number),

  DATABASE_URL: z.url(),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  CORS_ORIGIN: z.string()
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // pino is not yet initialised at boot; console.error is the right channel here.
  // eslint-disable-next-line no-console
  console.error(
    "Invalid environment configuration\n",
    z.prettifyError(result.error)
  );
  process.exit(1);
}

export const env: Readonly<Env> = Object.freeze(result.data);

export default env;
