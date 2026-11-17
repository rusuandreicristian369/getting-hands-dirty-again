import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.APP_PORT!,

  typeorm: {
    type: process.env.TYPEORM_TYPE! as 'mysql',
    host: process.env.TYPEORM_HOST!,
    port: Number(process.env.TYPEORM_PORT)!,
    database: process.env.TYPEORM_DATABASE!,
    username: process.env.TYPEORM_USERNAME!,
    password: process.env.TYPEORM_PASSWORD!,
  },
}));
