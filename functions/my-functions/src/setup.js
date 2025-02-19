import AppwriteService from './appwrite.js';
import { throwIfMissing } from './utils.js';

async function setup() {
  const databaseId = process.env.APPWRITE_DATABASE_ID ?? 'orders';
  const collectionId = process.env.APPWRITE_COLLECTION_ID ?? 'orders';


  const appwrite = new AppwriteService(process.env.APPWRITE_API_KEY_ID);

  if (await appwrite.doesOrdersDatabaseExist(databaseId)) {
    return;
  }

  await appwrite.setupOrdersDatabase(databaseId, collectionId);
}

setup();
