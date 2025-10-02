import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url().startsWith("postgres://"),
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
});

export const env = envSchema.parse(process.env);
