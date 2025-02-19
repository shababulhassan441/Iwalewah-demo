// pages/api/checkout.js

import OpayoService from 'src/opayo';
import db from '../../appwrite/Services/dbServices';
import { OpayoError } from 'src/opayo';
import { Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { checkoutData, items, successUrl, failureUrl } = req.body;
    const userId = req.headers['x-appwrite-user-id'];

    if (!items || !checkoutData) {
      return res.status(400).json({
        error: 'Missing items or checkoutData in request',
      });
    }

    // Destructure checkoutData
    const {
      customerFirstName,
      customerLastName,
      phoneNumber,
      email,
      paymentMethod,
      deliveryInstructions,
      cardPaymentDetails,
      // Delivery Address
      deliveryAddressLine1,
      deliveryAddressLine2,
      deliveryCity,
      deliveryRegion,
      deliveryPostalCode,
      deliveryCountry,
      // Billing Address
      billingAddressLine1,
      billingAddressLine2,
      billingCity,
      billingRegion,
      billingPostalCode,
      billingCountry,
      // Shipping Rate
      shippingRate, // Added: Shipping Rate
      // Voucher details
      voucherCode,
      discountAmount,
      voucherId, // Added: Voucher ID
    } = checkoutData;

    try {
      // Step 1: Fetch product details and check stock
      let productDetails = [];
      for (let item of items) {
        try {
          const product = await db.Products.get(item.id);
          if (!product) {
            console.error(`Product with ID ${item.id} not found.`);
            throw new Error(`Product with ID ${item.id} not found.`);
          }
          if (product.stockQuantity < item.quantity) {
            console.error(
              `Insufficient stock for product: ${product.name}. Available: ${product.stockQuantity}`
            );
            throw new Error(
              `Insufficient stock for product: ${product.name}. Available: ${product.stockQuantity}`
            );
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

      // Step 2: Calculate total price with price adjustments
      let totalPrice = productDetails.reduce((acc, item) => {
        let price;
        if (item.isOnSale) {
          price = item.discountPrice;
        } else {
          price = item.price;
        }
        return acc + price * item.quantity;
      }, 0);

      // **Add Shipping Rate to Total Price**
      totalPrice += shippingRate || 0;

      // **Subtract Discount Amount if any**
      if (discountAmount) {
        totalPrice -= discountAmount;
      }

      // Convert totalPrice to pennies for Opayo
      const amountInPence = Math.round(totalPrice * 100);

      if (paymentMethod === 'cardPayment') {
        // Proceed with Opayo payment
        const opayo = new OpayoService();

        // Step 3: Create Merchant Session
        let merchantSessionKey;
        try {
          const merchantSession = await opayo.createMerchantSession();
          merchantSessionKey = merchantSession.merchantSessionKey;
        } catch (error) {
          if (error instanceof OpayoError) {
            return res.status(500).json({ error: error.message });
          } else {
            return res
              .status(500)
              .json({ error: 'Failed to create merchant session.' });
          }
        }

        // Step 4: Create Card Identifier
        let cardIdentifier;
        try {
          cardIdentifier = await opayo.createCardIdentifier({
            cardholderName: cardPaymentDetails.cardHolderName,
            cardNumber: cardPaymentDetails.cardNumber.replace(/\s/g, ''), // Remove spaces
            expiryDate: cardPaymentDetails.expiry, // Format: MMYY
            securityCode: cardPaymentDetails.cardCode,
          });
        } catch (error) {
          if (error instanceof OpayoError) {
            return res.status(500).json({ error: error.message });
          } else {
            return res
              .status(500)
              .json({ error: 'Failed to create card identifier.' });
          }
        }

        // Step 5: Create Transaction
        let transaction;
        try {
          const paymentData = {
            transactionType: 'Payment',
            paymentMethod: {
              card: { cardIdentifier },
            },
            vendorTxCode: `TX-${Date.now()}`,
            amount: amountInPence,
            currency: 'GBP',
            description: 'Order Payment via Opayo',
            customerFirstName: customerFirstName,
            customerLastName: customerLastName,
            billingAddress: {
              address1: billingAddressLine1,
              address2: billingAddressLine2 || '',
              city: billingCity,
              region: billingRegion,
              postalCode: billingPostalCode,
              country: billingCountry,
            },
            vendorName: opayo.vendorName,
          };

          transaction = await opayo.createTransaction(paymentData);
        } catch (error) {
          if (error instanceof OpayoError) {
            return res.status(500).json({ error: error.message });
          } else {
            return res
              .status(500)
              .json({ error: 'Failed to create transaction.' });
          }
        }

        if (transaction.status === 'Ok') {
          // Step 6: Create Order
          let order;
          try {
            order = await db.Orders.create({
              userId,
              stripeOrderId: null, // No Stripe session ID for Opayo
              totalPrice, // Updated total price including shippingRate and discountAmount
              shippingRate: shippingRate || 0, // Store shippingRate
              orderStatus: 'pending',
              paymentStatus: 'paid', // Payment completed
              customerFirstName,
              customerLastName,
              // Delivery Address Fields
              deliveryAddressLine1,
              deliveryAddressLine2: deliveryAddressLine2 || '',
              deliveryCity,
              deliveryRegion,
              deliveryPostalCode,
              deliveryCountry,
              // Billing Address Fields
              billingAddressLine1,
              billingAddressLine2: billingAddressLine2 || '',
              billingCity,
              billingRegion,
              billingPostalCode,
              billingCountry,
              phoneNumber,
              email,
              paymentMethod,
              deliveryInstructions,
              transactionId: transaction.transactionId, // Use Opayo transaction ID
              // Voucher Details
              voucherCode: voucherCode || null,
              discountAmount: discountAmount || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('Failed to create order.');
          }

          // **Step 6a: Extract and Store `orderId`**
          const fullOrderId = order.$id; // Appwrite document ID
          const shortOrderId = fullOrderId.substring(0, 8); // First 8 characters

          try {
            // Update the order document with `orderId`
            await db.Orders.update(fullOrderId, {
              orderId: shortOrderId,
            });
          } catch (error) {
            console.error('Error updating order with orderId:', error);
            throw new Error('Failed to update order with orderId.');
          }

          // **Assign `fullOrderId` to `orderIdForResponse`**
          const orderIdForResponse = fullOrderId; // Use fullOrderId for response and redirect

          // **Step 6b: If voucher was applied, create UserVouchers entry**
          if (voucherId) {
            try {
              // Create a new UserVoucher entry
              await db.UserVouchers.create({
                userId,
                voucherId,
                isUsed: true,
                usedAt: new Date().toISOString(),
                orderId: fullOrderId,
              });
            } catch (error) {
              console.error('Error creating UserVouchers entry:', error);
              // Decide whether to throw error or proceed
              // Here, we proceed but log the error
            }
          }

          // Step 7: Create OrderItems and update product stock
          try {
            const orderItemsPromises = productDetails.map(async (item) => {
              let price;
              if (item.isOnSale) {
                price = item.discountPrice;
              } else {
                price = item.price;
              }

              await db.OrderItems.create({
                orderId: fullOrderId, // Use the full document ID for associations
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
              });

              // Update product stock
              const updatedStock = item.stockQuantity - item.quantity;
              // Stock already checked before payment
              await db.Products.update(item.$id, {
                stockQuantity: updatedStock,
              });
            });

            await Promise.all(orderItemsPromises);
          } catch (error) {
            console.error(
              'Error creating order items or updating stock:',
              error
            );
            throw new Error('Failed to create order items or update stock.');
          }

          // Step 8: Redirect to complete order page
          const redirectUrl = `${successUrl}/${orderIdForResponse}`;
          console.log(
            `Created card payment order for user ${userId} with Order ID ${orderIdForResponse}`
          );
          return res.status(200).json({
            redirectUrl,
            orderId: orderIdForResponse, // Return the full orderId for redirection and other uses
          });
        } else {
          // Handle transaction failure with detailed message
          return res.status(500).json({
            error: transaction.statusDetail || 'Transaction failed.',
          });
        }
      } else if (paymentMethod === 'directBankTransfer') {
        // Proceed with Direct Bank Transfer: Directly create Orders and OrderItems

        // **Ensure shippingRate and discountAmount are included in totalPrice**
        const finalTotalPrice = totalPrice; // Already includes shippingRate and discountAmount

        // Step 4: Create Order
        let order;
        try {
          order = await db.Orders.create({
            userId,
            stripeOrderId: null, // No Stripe session ID for Direct Bank Transfer
            totalPrice: finalTotalPrice, // Include shippingRate and discountAmount
            shippingRate: shippingRate || 0, // Store shippingRate
            orderStatus: 'pending',
            paymentStatus: 'directBankTransfer', // Payment pending as it's Direct Bank Transfer
            customerFirstName,
            customerLastName,
            // Delivery Address Fields
            deliveryAddressLine1,
            deliveryAddressLine2: deliveryAddressLine2 || '',
            deliveryCity,
            deliveryRegion,
            deliveryPostalCode,
            deliveryCountry,
            // Billing Address Fields
            billingAddressLine1,
            billingAddressLine2: billingAddressLine2 || '',
            billingCity,
            billingRegion,
            billingPostalCode,
            billingCountry,
            phoneNumber,
            email,
            paymentMethod,
            deliveryInstructions,
            // Voucher Details
            voucherCode: voucherCode || null,
            discountAmount: discountAmount || null,
            paymentIntentId: null, // No Payment Intent ID for Direct Bank Transfer
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error creating order:', error);
          throw new Error('Failed to create order.');
        }

        // **Step 6a: Extract and Store `orderId` for Direct Bank Transfer**
        const fullOrderId = order.$id; // Appwrite document ID
        const shortOrderId = fullOrderId.substring(0, 8); // First 8 characters

        try {
          // Update the order document with `orderId`
          await db.Orders.update(fullOrderId, {
            orderId: shortOrderId,
          });
        } catch (error) {
          console.error('Error updating order with orderId:', error);
          throw new Error('Failed to update order with orderId.');
        }

        // **Assign `fullOrderId` to `orderIdForResponse`**
        const orderIdForResponse = fullOrderId; // Use fullOrderId for response and redirect

        // **Step 6b: If voucher was applied, create UserVouchers entry**
        if (voucherId) {
          try {
            // Create a new UserVoucher entry
            await db.UserVouchers.create({
              userId,
              voucherId,
              isUsed: true,
              usedAt: new Date().toISOString(),
              orderId: fullOrderId,
            });
          } catch (error) {
            console.error('Error creating UserVouchers entry:', error);
            // Decide whether to throw error or proceed
            // Here, we proceed but log the error
          }
        }

        // Step 5: Create OrderItems and update product stock
        try {
          const orderItemsPromises = productDetails.map(async (item) => {
            let price;
            if (item.isOnSale) {
              price = item.discountPrice;
            } else {
              price = item.price;
            }

            await db.OrderItems.create({
              orderId: fullOrderId, // Use the full document ID for associations
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
            });

            // Update product stock
            const updatedStock = item.stockQuantity - item.quantity;
            // Stock already checked before payment
            await db.Products.update(item.$id, {
              stockQuantity: updatedStock,
            });
          });

          await Promise.all(orderItemsPromises);
        } catch (error) {
          console.error('Error creating order items or updating stock:', error);
          throw new Error('Failed to create order items or update stock.');
        }

        // Step 8: Redirect to complete order page
        const redirectUrl = `${successUrl}/${orderIdForResponse}`;
        console.log(
          `Created Direct Bank Transfer order for user ${userId} with Order ID ${orderIdForResponse}`
        );

        return res
          .status(200)
          .json({ success: true, orderId: orderIdForResponse, redirectUrl });
      } else {
        return res.status(400).json({ error: 'Invalid payment method' });
      }
    } catch (err) {
      console.error('Error processing order:', err);
      return res
        .status(500)
        .json({ error: err.message || 'Failed to process order.' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
