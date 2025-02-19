import isEmpty from 'lodash/isEmpty';
import storageServices from 'src/appwrite/Services/storageServices';

interface Item {
  id: string | number;
  name: string;
  slug: string;
  images: string[]; // Assume images are an array of image IDs
  price: number;
  sale_price?: number;
  quantity?: number;
  stockQuantity?: number; // Add this line
  unit?: string;
  isWholesaleProduct?: boolean;
  minimumPurchaseQuantity?: number;
  [key: string]: unknown;
}

interface Variation {
  id: string | number;
  title: string;
  price: number;
  sale_price?: number;
  quantity: number;
  [key: string]: unknown;
}

// Helper function to fetch the image URL using storage service
async function getImageUrl(imageId: string): Promise<string> {
  const imagePreviewUrl = storageServices['images'].getFilePreview(imageId);
  return imagePreviewUrl.href;
}

// Modify generateCartItem to support fetching the correct image URL
export async function generateCartItem(item: Item, variation: Variation) {
  const {
    id,
    name,
    slug,
    images,
    price,
    sale_price,
    quantity,
    unit,
    stockQuantity,
    isWholesaleProduct = false,
    minimumPurchaseQuantity = 1,
  } = item;

  const stock = stockQuantity || quantity || 0;

  // Get the first image ID from the array and convert it to a URL
  const imageId = images && images.length > 0 ? images[0] : null;
  const imageUrl = imageId ? await getImageUrl(imageId) : '/path/to/placeholder/image.jpg';

  if (!isEmpty(variation)) {
    return {
      id: `${id}.${variation.id}`,
      productId: id,
      name: `${name} - ${variation.title}`,
      slug,
      unit,
      stock: variation.quantity,
      price: variation.sale_price ? variation.sale_price : variation.price,
      image: imageUrl,
      variationId: variation.id,
      isWholesaleProduct,
      minimumPurchaseQuantity,
    };
  }

  return {
    id,
    name,
    slug,
    unit,
    stock,
    price: sale_price ? sale_price : price,
    image: imageUrl,
    isWholesaleProduct,
    minimumPurchaseQuantity,
  };
}
