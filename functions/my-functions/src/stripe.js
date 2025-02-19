import stripe from './stripe';
class StripeService {
  constructor() {
    // Select the correct environment variable depending on where the code is running
    const stripeSecretKey =
      process.env.NEXT_PUBLIC_APPWRITE_STRIPE_SECRET_KEY || // Used in your project
      process.env.STRIPE_SECRET_KEY; // Used in Appwrite Cloud Function

    if (!stripeSecretKey) {
      throw new Error('Stripe Secret Key is not defined.');
    }

    this.client = stripe(stripeSecretKey);
  }

  async checkoutPayment(
    context,
    userId,
    successUrl,
    failureUrl,
    items,
    deliveryMetadataId
  ) {
    const lineItems = items.map((item) => ({
      price_data: {
        unit_amount: Math.round(item.price * 100), // Ensure price is converted to cents
        currency: 'usd',
        product_data: {
          name: item.name, // Placeholder name, will fetch actual data later
        },
      },
      quantity: item.quantity,
    }));

    try {
      return await this.client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: failureUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          deliveryMetadataId, // Pass the delivery metadata ID here
          items: JSON.stringify(
            items.map((item) => ({ id: item.id, quantity: item.quantity }))
          ), // Store only product id and quantity in metadata
        },
        mode: 'payment',
      });
    } catch (err) {
      context.error(err);
      return null;
    }
  }

  validateWebhook(context, req) {
    // Select the correct webhook secret depending on where the code is running
    const webhookSecret =
      process.env.NEXT_PUBLIC_APPWRITE_STRIPE_WEBHOOK_SECRET || // Used in your project
      process.env.STRIPE_WEBHOOK_SECRET; // Used in Appwrite Cloud Function

    if (!webhookSecret) {
      throw new Error('Stripe Webhook Secret is not defined.');
    }

    try {
      const event = this.client.webhooks.constructEvent(
        req.bodyBinary,
        req.headers['stripe-signature'],
        webhookSecret
      );
      return event;
    } catch (err) {
      context.error(err);
      return null;
    }
  }
}

export default StripeService;
