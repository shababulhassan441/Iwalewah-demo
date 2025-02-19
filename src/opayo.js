// services/opayo.js

import axios from 'axios';
// import { OpayoError } from './OpayoError'; // Import the custom error class

// services/OpayoError.ts

export class OpayoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OpayoError';
  }
}

/**
 * OpayoService
 * A service class to interact with Opayo (Sage Pay) APIs for payment processing.
 */
class OpayoService {
  constructor() {
    // Load environment variables
    this.vendorName = process.env.OPAYO_VENDOR_NAME;
    this.integrationKey = process.env.OPAYO_INTEGRATION_KEY;
    this.integrationPassword = process.env.OPAYO_INTEGRATION_PASSWORD;
    this.environment = process.env.OPAYO_ENVIRONMENT;

    // Validate essential environment variables
    if (!this.vendorName || !this.integrationKey || !this.integrationPassword) {
      throw new Error(
        'Opayo credentials are not defined in environment variables.'
      );
    }

    // Set the base URL based on the environment
    this.baseURL =
      this.environment === 'sandbox'
        ? 'https://pi-test.sagepay.com'
        : 'https://pi-live.sagepay.com';

    // Initialize Axios instance with 'Content-Type' set to 'application/json' for POST requests
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json', // Set default Content-Type for all requests
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Override default POST headers to ensure 'application/json' is used
    this.axiosInstance.defaults.headers.post['Content-Type'] =
      'application/json';

    this.merchantSessionKey = null;

    // Add request interceptor for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      this.axiosInstance.interceptors.request.use(
        (config) => {
         
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Add response interceptor for debugging (remove in production)
      this.axiosInstance.interceptors.response.use(
        (response) => {
          console.log('Received response:', response.data);
          return response;
        },
        (error) => {
          console.error(
            'Response error:',
            error.response?.data || error.message
          );
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Creates a Merchant Session Key
   * @returns {Promise<{ merchantSessionKey: string, expiry: string }>}
   */
  async createMerchantSession() {
    try {
      const response = await this.axiosInstance.post(
        '/api/v1/merchant-session-keys',
        {
          vendorName: this.vendorName,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.integrationKey}:${this.integrationPassword}`
            ).toString('base64')}`,
            // 'Content-Type' is already set to 'application/json' by default
          },
        }
      );

      const { merchantSessionKey, expiry } = response.data;
      this.merchantSessionKey = merchantSessionKey;

      return { merchantSessionKey, expiry };
    } catch (error) {
      console.error(
        'Error creating merchant session:',
        error.response?.data || error.message
      );
      if (error.response && error.response.data && error.response.data.errors) {
        const messages = error.response.data.errors
          .map((err) => err.clientMessage)
          .join('; ');
        throw new OpayoError(messages);
      } else {
        throw new OpayoError('Failed to create merchant session.');
      }
    }
  }

  /**
   * Creates a Card Identifier using Card Details
   * @param {Object} cardDetails - { cardholderName, cardNumber, expiryDate, securityCode }
   * @returns {Promise<string>} cardIdentifier
   */
  async createCardIdentifier(cardDetails) {
    if (!this.merchantSessionKey) {
      throw new OpayoError('Merchant session key is not set.');
    }

    // Basic validation of card details
    const { cardholderName, cardNumber, expiryDate, securityCode } =
      cardDetails;
    if (!cardholderName || !cardNumber || !expiryDate || !securityCode) {
      throw new OpayoError('Incomplete card details provided.');
    }

    try {
      const response = await this.axiosInstance.post(
        '/api/v1/card-identifiers',
        {
          cardDetails: {
            cardholderName,
            cardNumber,
            expiryDate, // Format: MMYY
            securityCode,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.merchantSessionKey}`,
          },
        }
      );

      const { cardIdentifier } = response.data;
      return cardIdentifier;
    } catch (error) {
      console.error(
        'Error creating card identifier:',
        error.response?.data || error.message
      );
      if (error.response && error.response.data && error.response.data.errors) {
        const messages = error.response.data.errors
          .map((err) => err.clientMessage)
          .join('; ');
        throw new OpayoError(messages);
      } else {
        throw new OpayoError('Failed to create card identifier.');
      }
    }
  }

  /**
   * Creates a Transaction
   * @param {Object} paymentData - { amount, currency, description, paymentMethod, vendorTxCode, customerFirstName, customerLastName, billingAddress }
   * @returns {Promise<Object>} Transaction Response
   */
  async createTransaction(paymentData) {
    if (!this.merchantSessionKey) {
      throw new OpayoError('Merchant session key is not set.');
    }
    const merchantSessionKey = this.merchantSessionKey;

    // Destructure required fields
    const {
      amount,
      currency,
      description,
      paymentMethod,
      vendorTxCode,
      customerFirstName,
      customerLastName,
      billingAddress,
      // Add other fields as needed
    } = paymentData;

    // Validate required fields
    if (
      !amount ||
      !currency ||
      !description ||
      !paymentMethod ||
      !paymentMethod.card ||
      !paymentMethod.card.cardIdentifier ||
      !vendorTxCode
    ) {
      throw new OpayoError('Incomplete payment data provided.');
    }

    const cardIdentifier = paymentMethod.card.cardIdentifier;

    // Construct the payload as per PHP CreatePayment::jsonSerialize()
    const data = {
      transactionType: 'Payment',
      paymentMethod: {
        card: {
          merchantSessionKey,
          cardIdentifier,
        },
      },
      vendorTxCode,
      amount: parseInt(amount, 10), // Ensure amount is an integer
      currency,
      description,
      customerFirstName,
      customerLastName,
      billingAddress,
      vendorName: this.vendorName, // Ensure vendorName is included
    };

    try {

      const response = await this.axiosInstance.post(
        '/api/v1/transactions',
        data,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.integrationKey}:${this.integrationPassword}`
            ).toString('base64')}`,
            // 'Content-Type' is already set to 'application/json' by default
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error creating transaction:',
        error.response?.data || error.message
      );
      if (error.response && error.response.data && error.response.data.errors) {
        const messages = error.response.data.errors
          .map((err) => err.clientMessage)
          .join('; ');
        throw new OpayoError(messages);
      } else {
        throw new OpayoError('Failed to create transaction.');
      }
    }
  }
}

export default OpayoService;
