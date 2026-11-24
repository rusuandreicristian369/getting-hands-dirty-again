import { MySqlContainer } from '@testcontainers/mysql';

export const createMysqlContainer = async () => {
  const mysql = await new MySqlContainer('mysql:8.4')
    .withDatabase('shop')
    .start();
  process.env.TYPEORM_TYPE = 'mysql';
  process.env.TYPEORM_HOST = mysql.getHost();
  process.env.TYPEORM_PORT = String(mysql.getPort());
  process.env.TYPEORM_DATABASE = mysql.getDatabase();
  process.env.TYPEORM_USERNAME = mysql.getUsername();
  process.env.TYPEORM_PASSWORD = mysql.getUserPassword();

  return mysql;
};
