export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CreateSessionOrder {
  id: string;
  amount: number;
}

export type CloseSessionResponse = 'expired' | 'paid';

export abstract class PaymentGateway {
  abstract createSession(order: CreateSessionOrder): Promise<CheckoutSession>;
  abstract closeSession(sessionId: string): Promise<CloseSessionResponse>;
}
