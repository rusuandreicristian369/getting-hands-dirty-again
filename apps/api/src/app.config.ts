import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  APP_PORT: z.string(),

  TYPEORM_TYPE: z.string(),
  TYPEORM_HOST: z.string(),
  TYPEORM_PORT: z.coerce.number().int(),
  TYPEORM_DATABASE: z.string(),
  TYPEORM_USERNAME: z.string(),
  TYPEORM_PASSWORD: z.string(),
});

const appConfig = registerAs('app', () => {
  const env = envSchema.parse(process.env);

  return {
    port: process.env.APP_PORT!,

    typeorm: {
      type: env.TYPEORM_TYPE! as 'mysql',
      host: env.TYPEORM_HOST!,
      port: Number(env.TYPEORM_PORT)!,
      database: env.TYPEORM_DATABASE!,
      username: env.TYPEORM_USERNAME!,
      password: env.TYPEORM_PASSWORD!,
    },
  };
});

export default appConfig;
export type AppConfig = ConfigType<typeof appConfig>;
