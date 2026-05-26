declare module "goatx402-sdk-server" {
  export class GoatX402 {
    constructor(config: {
      apiUrl?: string;
      apiKey?: string;
      apiSecret?: string;
      merchantId?: string;
    });
    middleware(config: { amount: string; symbol: string }): unknown;
  }
}
