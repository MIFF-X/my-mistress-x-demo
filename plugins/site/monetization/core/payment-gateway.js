export function createPaymentGateway() {
  return {
    id: 'site-payment-gateway',
    status: 'scaffold',
    supportedMethods: ['wallet', 'manual-review', 'provider-adapter'],
  };
}
