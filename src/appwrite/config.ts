import { Client, Account, Databases, Storage,Teams } from 'appwrite';

// Access environment variables
const Endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string;
const projectID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;

const client = new Client();

client
  .setEndpoint(Endpoint) // Your Appwrite Endpoint
  .setProject(projectID); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);


export { databaseId, projectID,client };
