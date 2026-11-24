import {
  CheckoutSession,
  CloseSessionResponse,
  CreateSessionOrder,
  PaymentGateway,
} from '../../src/payment/payment.gateway.js';

export class FakePaymentGateway extends PaymentGateway {
  readonly closed: string[] = [];

  async createSession(order: CreateSessionOrder): Promise<CheckoutSession> {
    return {
      id: `cs_test_${order.id}`,
      url: `https://stripe.test/pay/cs_test_${order.id}`,
    };
  }

  async closeSession(sessionId: string): Promise<CloseSessionResponse> {
    this.closed.push(sessionId);

    return 'expired';
  }

  async reset() {
    this.closed.length = 0;
  }
}
