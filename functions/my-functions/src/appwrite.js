import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const databaseId = process.env.APPWRITE_DATABASE_ID;
const productsCollectionId = process.env.APPWRITE_PRODUCTS_COLLECTION_ID;

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(
        process.env.APPWRITE_API_KEY_ID // Your API Key
      );

    this.databases = new Databases(client);
  }

  // General function to get document by ID
  async getDocument(databaseId, collectionId, documentId) {
    try {
      const document = await this.databases.getDocument(
        databaseId,
        collectionId,
        documentId
      );
      return document;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  // General function to delete a document
  async deleteDocument(databaseId, collectionId, documentId) {
    try {
      await this.databases.deleteDocument(databaseId, collectionId, documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Create a new order document.
   */
  async createOrder(
    databaseId,
    collectionId,
    userId,
    stripeOrderId, // Now we save stripeOrderId
    totalPrice,
    orderStatus,
    paymentStatus,
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
    paymentIntentId
  ) {
    const orderDocument = {
      userId,
      stripeOrderId, // Store the Stripe session ID (stripeOrderId)
      totalPrice,
      orderStatus,
      paymentStatus,
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
      paymentIntentId, // Optionally store Payment Intent ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        orderDocument
      );
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Create a new order item document for each product.
   */
  async createOrderItem(databaseId, collectionId, orderId, item) {
    // Determine the price based on the conditions
    let price;
    if (item.isOnSale) {
      price = item.discountPrice;
    } else if (item.isWholesaleProduct) {
      price = item.wholesalePrice;
    } else {
      price = item.price;
    }

    const orderItemDocument = {
      orderId, // Now we use the order document ID here
      productId: item.$id,
      productName: item.name,
      quantity: item.quantity,
      price: price, // Use the calculated price
      subtotal: price * item.quantity, // Calculate subtotal using the correct price
      description: item.description,
      discountPrice: item.discountPrice,
      categoryId: item.categoryId,
      images: item.images,
      tags: item.tags,
      isOnSale: item.isOnSale,
      isWholesaleProduct: item.isWholesaleProduct,
      wholesalePrice: item.wholesalePrice,
    };

    try {
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        orderItemDocument
      );
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  async updateProductStock(productId, quantityPurchased) {
    const product = await this.getDocument(
      databaseId,
      productsCollectionId,
      productId
    );
    const updatedStock = product.stockQuantity - quantityPurchased;

    try {
      await this.databases.updateDocument(
        databaseId,
        productsCollectionId,
        productId,
        { stockQuantity: updatedStock }
      );
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  /**
   * Check if the Orders database exists.
   * @param {string} databaseId
   * @returns {Promise<boolean>}
   */
  async doesOrdersDatabaseExist(databaseId) {
    try {
      await this.databases.get(databaseId);
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  /**
   * Set up the Orders database and collection.
   * @param {string} databaseId
   * @param {string} collectionId
   * @returns {Promise<boolean>}
   */
  async setupOrdersDatabase(databaseId, collectionId) {
    try {
      await this.databases.create(databaseId, 'Orders Database');
    } catch (err) {
      if (err.code !== 409) throw err; // Skip if it already exists
    }
    try {
      await this.databases.createCollection(
        databaseId,
        collectionId,
        'Orders Collection',
        undefined,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'userId',
        255,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'orderId',
        255,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
