// services/types.tsx

import { QueryKey } from 'react-query';

export type CollectionsQueryOptionsType = {
  text?: string;
  collection?: string;
  status?: string;
  limit?: number;
};

export type CategoriesQueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};

export type ProductsQueryOptionsType = {
  type: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};

export type QueryOptionsType = {
  text?: string;
  categoryId?: string | string[]; // Added categoryId
  status?: string;
  limit?: number;
  sortBy?: string | string[]; // Add sortBy to QueryOptionsType
  isWholesaleProduct?: boolean;
  search?: string;
  [key: string]: any;
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};

export type Attachment = {
  id: string | number;
  thumbnail: string;
  original: string;
};

// src/framework/types/index.ts

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  parentId?: string | null;
  children: Category[];
  slug: string;
}


export type Collection = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  products?: Product[];
  productCount?: number;
};

export type Brand = {
  id: number | string;
  name: string;
  slug: string;
  image?: Attachment;
  [key: string]: unknown;
};

export type Dietary = {
  id: number | string;
  name: string;
  slug: string;
  [key: string]: unknown;
};

export type Tag = {
  id: string | number;
  name: string;
  // slug: string;
};
// services/types.tsx

export type Product = {
  id: string; // Appwrite document ID
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  categoryId: string; // Reference to the category it belongs to
  images?: string[]; // Array of image IDs from Appwrite storage
  imageUrls: string[]; // Array of image URLs fetched from storage
  tags: string[];
  isOnSale?: boolean;
  isWholesaleProduct?: boolean;
  wholesalePrice?: number;
  [key: string]: unknown;
};

export type OrderItem = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string | number;
  name: string;
  slug: string;
  products: OrderItem[];
  total: number;
  tracking_number: string;
  customer: {
    id: number;
    email: string;
  };
  shipping_fee: number;
  payment_gateway: string;
};

export type ShopsQueryOptionsType = {
  text?: string;
  shop?: Shop;
  status?: string;
  limit?: number;

};

export type Shop = {
  id: string | number;
  owner_id: string | number;
  owner_name: string;
  address: string;
  phone: string;
  website: string;
  ratings: string;
  name: string;
  slug: string;
  description: string;
  cover_image: Attachment;
  logo: Attachment;
  socialShare: any;
  created_at: string;
  updated_at: string;
};

// **Authentication and User Types**


export type LoginInputType = {
  email: string;
  password: string;
  remember_me: boolean;
};


export type UserDocument = {
  $id: string;
  userId: string;
  role: "user" | "admin";
  name: string;
  isWholesaleApproved: boolean;
  telephone:string;
  email: string;
};

export type AuthResponse = {
  session: any; // Replace 'any' with actual session type if available
  userDoc: UserDocument;
};

// @framework/types.ts

export interface SignUpInputType {
  countryCode: any;
  email: string;
  password: string;
  name: string;
  remember_me: boolean;
  telephone: string; // Added telephone field
  recaptcha: any
}

// @framework/types.ts

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  telephone: string; // Added telephone field
}
