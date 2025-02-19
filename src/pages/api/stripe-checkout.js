import StripeService from '../../../functions/my-functions/src/stripe';
import db from '../../appwrite/Services/dbServices';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { items, successUrl, failureUrl, customerDetails } = req.body;
    const userId = req.headers['x-appwrite-user-id'];

    if (!items || !customerDetails) {
      return res.status(400).json({
        error: 'Missing userId, items, or customerDetails in request',
      });
    }

    // Destructure customer details, including billingAddress fields
    const {
      customerFirstName,
      customerLastName,
      billingAddress: {
        addressLine1,
        addressLine2,
        city,
        region,
        postalCode,
        country,
      },
      phoneNumber,
      email,
      paymentMethod,
      deliveryInstructions,
    } = customerDetails;

    try {
      // Step 1: Store DeliveryMetadata in Appwrite
      const deliveryMetadata = await db.DeliveryMetadata.create({
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
      });

      const deliveryMetadataId = deliveryMetadata.$id;

      if (paymentMethod === 'cardPayment') {
        // Proceed with Stripe payment
        const stripe = new StripeService();

        const session = await stripe.checkoutPayment(
          { error: console.error },
          userId,
          successUrl,
          failureUrl,
          items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryMetadataId
        );

        if (!session) {
          return res
            .status(500)
            .json({ error: 'Failed to create Stripe session' });
        }

        return res.status(200).json({ url: session.url });
      } else if (paymentMethod === 'cashOnDelivery') {
        // Proceed with COD: Directly create Orders and OrderItems

        // Fetch product details with detailed error logging
        let productDetails = [];
        for (let item of items) {
          try {
            const product = await db.Products.get(item.id);
            if (!product) {
              console.error(`Product with ID ${item.id} not found.`);
              throw new Error(`Product with ID ${item.id} not found.`);
            }
            productDetails.push({
              ...product,
              quantity: item.quantity,
            });
          } catch (error) {
            console.error(`Error fetching product ID ${item.id}:`, error);
            throw new Error(
              `Error fetching product ID ${item.id}: ${error.message}`
            );
          }
        }

        // Calculate total price with price adjustments
        const totalPrice = productDetails.reduce((acc, item) => {
          let price;
          if (item.isOnSale) {
            price = item.discountPrice;
          } else if (item.isWholesaleProduct) {
            price = item.wholesalePrice;
          } else {
            price = item.price;
          }
          return acc + price * item.quantity;
        }, 0);

        // Create Order
        const order = await db.Orders.create({
          userId,
          stripeOrderId: null, // No Stripe session ID for COD
          totalPrice,
          orderStatus: 'pending',
          paymentStatus: 'cashOnDelivery', // Payment pending as it's COD
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
          paymentIntentId: null, // No Payment Intent ID for COD
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const orderId = order.$id;

        // Create OrderItems and update product stock
        const orderItemsPromises = productDetails.map(async (item) => {
          let price;
          if (item.isOnSale) {
            price = item.discountPrice;
          } else if (item.isWholesaleProduct) {
            price = item.wholesalePrice;
          } else {
            price = item.price;
          }

          await db.OrderItems.create({
            orderId,
            productId: item.$id,
            productName: item.name,
            quantity: item.quantity,
            price: price,
            subtotal: price * item.quantity,
            description: item.description,
            discountPrice: item.discountPrice || 0,
            categoryId: item.categoryId,
            images: item.images,
            tags: item.tags,
            isOnSale: item.isOnSale,
            isWholesaleProduct: item.isWholesaleProduct,
            wholesalePrice: item.wholesalePrice || 0,
          });

          // Update product stock
          const updatedStock = item.stockQuantity - item.quantity;
          if (updatedStock < 0) {
            console.error(`Insufficient stock for product ID: ${item.$id}`);
            throw new Error(`Insufficient stock for product ID: ${item.$id}`);
          }

          await db.Products.update(item.$id, {
            stockQuantity: updatedStock,
          });
        });

        await Promise.all(orderItemsPromises);

        // Delete DeliveryMetadata after processing
        await db.DeliveryMetadata.delete(deliveryMetadataId);

        console.log(
          `Created COD order for user ${userId} with Order ID ${orderId}`
        );

        return res.status(200).json({ success: true, orderId });
      } else {
        return res.status(400).json({ error: 'Invalid payment method' });
      }
    } catch (err) {
      console.error('Error processing order:', err);
      return res
        .status(500)
        .json({ error: `Failed to process order: ${err.message}` });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
