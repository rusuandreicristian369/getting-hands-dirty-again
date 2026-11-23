import { Test, TestingModule } from '@nestjs/testing';
import { OrderConsumerController } from './order-consumer.controller.js';

describe('OrderConsumerController', () => {
  let controller: OrderConsumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderConsumerController],
    }).compile();

    controller = module.get<OrderConsumerController>(OrderConsumerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
