import { collections, Collection } from '../collections';
import { databaseId, databases } from '../config';
import { ID, Models, Query } from 'appwrite';

interface DBServices {
  [key: string]: {
    create: (payload: any, id?: string) => Promise<Models.Document>;
    update: (id: string, payload: any) => Promise<Models.Document>;
    get: (id: string) => Promise<Models.Document>;
    list: (queries?: string[]) => Promise<Models.DocumentList<Models.Document>>;
    delete: (id: string) => Promise<void>;
  };
}

const db: DBServices = {};

collections.forEach((col: Collection) => {
  db[col.name] = {
    create: async (payload, id = ID.unique()) => {
      return await databases.createDocument(databaseId, col.id, id, payload);
    },

    update: async (id, payload) => {
      return await databases.updateDocument(databaseId, col.id, id, payload);
    },

    get: async (id) => {
      return await databases.getDocument(databaseId, col.id, id);
    },

    list: async (queries) => {
      // Ensure queries is an array of strings or undefined
      return await databases.listDocuments(databaseId, col.id, queries ?? []);
    },

    delete: async (id) => {
      await databases.deleteDocument(databaseId, col.id, id);
    },
  };
});

export default db;
