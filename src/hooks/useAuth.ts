// hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { getCurrentUser } from 'src/appwrite/Services/authServices';
import { UserDocument } from '@framework/types';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
export const useAuth = () => {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const appwriteUser = await getCurrentUser();
        if (appwriteUser) {
          // Fetch the corresponding UserDocument from the Users collection
          const userDocs = await db.Users.list([
            Query.equal('userId', appwriteUser.$id),
          ]);
          if (userDocs.documents.length > 0) {
            setUser(userDocs.documents[0] as any);
          } else {
            console.error('User document not found.');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};
