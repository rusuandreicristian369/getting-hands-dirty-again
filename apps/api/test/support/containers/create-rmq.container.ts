import { RabbitMQContainer } from '@testcontainers/rabbitmq';

export const createRabbitMQContainer = async () => {
  const rabbit = await new RabbitMQContainer('rabbitmq:4.1-alpine').start();
  process.env.RABBITMQ_URL = rabbit.getAmqpUrl();

  return rabbit;
};
