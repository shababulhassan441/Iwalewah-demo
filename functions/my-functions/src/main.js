import StripeService from './stripe.js';
import AppwriteService from './appwrite.js';
import { getStaticFile, interpolate } from './utils.js';

export default async (context) => {
  const { req, res, log, error } = context;

  const databaseId = process.env.APPWRITE_DATABASE_ID; // Database ID
  const ordersCollectionId = process.env.APPWRITE_COLLECTION_ID; // Orders Collection ID
  const orderItemsCollectionId = process.env.APPWRITE_ORDER_ITEMS_COLLECTION_ID; // Order Items Collection ID
  const deliveryMetadataCollectionId =
    process.env.APPWRITE_DELIVERY_METADATA_COLLECTION_ID; // Delivery Metadata Collection ID
  const productsCollectionId = process.env.APPWRITE_PRODUCTS_COLLECTION_ID; // Products Collection ID

  if (req.method === 'GET') {
    const html = interpolate(getStaticFile('index.html'), {
      APPWRITE_FUNCTION_API_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
      APPWRITE_FUNCTION_ID: process.env.APPWRITE_FUNCTION_ID,
      APPWRITE_DATABASE_ID: databaseId,
      APPWRITE_COLLECTION_ID: ordersCollectionId,
    });

    return res.text(html, 200, { 'Content-Type': 'text/html; charset=utf-8' });
  }

  const appwrite = new AppwriteService();
  const stripe = new StripeService();

  switch (req.path) {
    case '/checkout':
      const fallbackUrl = req.scheme + '://' + req.headers['host'] + '/';
      const successUrl = req.body?.successUrl ?? fallbackUrl;
      const failureUrl = req.body?.failureUrl ?? fallbackUrl;
      const items = req.body.items;
      const userId = req.headers['x-appwrite-user-id'];

      if (!userId) {
        error('User ID not found in request.');
        return res.redirect(failureUrl, 303);
      }

      const session = await stripe.checkoutPayment(
        context,
        userId,
        successUrl,
        failureUrl,
        items
      );
      if (!session) {
        error('Failed to create Stripe checkout session.');
        return res.redirect(failureUrl, 303);
      }

      log(`Created Stripe checkout session for user ${userId}.`);
      return res.redirect(session.url, 303);

    case '/webhook':
      const event = stripe.validateWebhook(context, req);
      if (!event) {
        return res.json({ success: false }, 401);
      }

      log('Event:', event);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const deliveryMetadataId = session.metadata.deliveryMetadataId;
        const stripeOrderId = session.id; // Store session.id as stripeOrderId
        const items = JSON.parse(session.metadata.items);

        // Get the Payment Intent ID
        const paymentIntentId = session.payment_intent;
        log(`Payment Intent ID: ${paymentIntentId}`);

        // Fetch DeliveryMetadata using deliveryMetadataId
        const deliveryMetadata = await appwrite.getDocument(
          databaseId,
          deliveryMetadataCollectionId,
          deliveryMetadataId
        );
        const {
          customerFirstName,
          customerLastName,
          addressLine1,
          addressLine2,
          city,
          region,
          postalCode,
          country,
          phoneNumber,
          email,
          paymentMethod,
          deliveryInstructions,
        } = deliveryMetadata;

        // Fetch full product details from Appwrite using product IDs
        let productDetails = [];
        for (let item of items) {
          const product = await appwrite.getDocument(
            databaseId,
            productsCollectionId,
            item.id
          );
          productDetails.push({
            ...product,
            quantity: item.quantity,
          });
        }

        // Correct total price calculation and log total
        // const totalPrice = productDetails.reduce(
        //   (acc, item) => acc + item.price * item.quantity,
        //   0
        // );
        // log(`Total Price: ${totalPrice}`);

        // Total price from Stripe session
        const totalPrice = session.amount_total / 100; // Stripe returns amounts in cents, so divide by 100 to get the total in the correct format.
        log(`Total Price from Stripe: ${totalPrice}`);

        // Step 2: Create the order document in Orders collection
        const order = await appwrite.createOrder(
          databaseId,
          ordersCollectionId,
          userId,
          stripeOrderId, // Save stripeOrderId (session.id) to Orders collection
          totalPrice,
          'pending', // Order Status
          'completed', // Payment Status
          customerFirstName,
          customerLastName,
          addressLine1,
          addressLine2,
          city,
          region,
          postalCode,
          country,
          phoneNumber,
          email,
          paymentMethod,
          deliveryInstructions,
          paymentIntentId // Optionally store the paymentIntentId in Orders collection
        );

        const orderId = order.$id; // The newly created order's ID

        // Use Promise.all() to ensure all items are stored in OrderItems collection
        await Promise.all(
          productDetails.map(async (item) => {
            await appwrite.createOrderItem(
              databaseId,
              orderItemsCollectionId,
              orderId, // Pass the newly created order's document ID
              item
            );

            // Update product stock
            await appwrite.updateProductStock(item.$id, item.quantity);
          })
        );

        // Delete DeliveryMetadata after processing
        await appwrite.deleteDocument(
          databaseId,
          deliveryMetadataCollectionId,
          deliveryMetadataId
        );

        log(
          `Created order and order items for user ${userId} with Stripe order ID ${stripeOrderId}`
        );
        return res.json({ success: true });
      }

      return res.json({ success: true });

    default:
      return res.text('Not Found', 404);
  }
};
