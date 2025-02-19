import { buckets, Bucket } from "../buckets";
import { storage } from "../config"; // Ensure you have initialized Appwrite client and storage service
import { ID, Models } from "appwrite";

// Rename the FileList type to avoid conflict with DOM FileList
interface AppwriteFileList {
  total: number;
  files: Models.File[];
}

// Use the built-in `File` type for file uploads and `URL` for download/view URLs
interface StorageServices {
  [key: string]: {
    createFile: (file: File, id?: string) => Promise<Models.File>;
    deleteFile: (id: string) => Promise<void>;
    getFile: (id: string) => Promise<Models.File>;
    getFileDownload: (id: string) => URL;
    getFilePreview: (id: string, options?: number) => URL;
    getFileView: (id: string) => URL;
    listFiles: (queries?: string[]) => Promise<AppwriteFileList>;
    updateFile: (id: string, file: string) => Promise<Models.File>;
  };
}

const storageServices: StorageServices = {};

buckets.forEach((bucket: Bucket) => {
  storageServices[bucket.name] = {
    createFile: async (file, id = ID.unique()) => {
      // Ensure the file is a native File or Blob type
      return await storage.createFile(bucket.id, id, file);
    },

    deleteFile: async (id) => {
      await storage.deleteFile(bucket.id, id);
    },

    getFile: async (id) => {
      return await storage.getFile(bucket.id, id);
    },

    getFileDownload: (id) => {
      // Returning the URL object directly
      return new URL(storage.getFileDownload(bucket.id, id));
    },

    getFilePreview: (id, options) => {
      // Returning the URL object directly
      return new URL(storage.getFilePreview(bucket.id, id, options));
    },

    getFileView: (id) => {
      // Returning the URL object directly
      return new URL(storage.getFileView(bucket.id, id));
    },

    listFiles: async (queries) => {
      return await storage.listFiles(bucket.id, queries ?? []);
    },

    updateFile: async (id, file) => {
      return await storage.updateFile(bucket.id, id, file);
    },
  };
});

export default storageServices;
