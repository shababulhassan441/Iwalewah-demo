// src/contexts/user.context.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser } from 'src/appwrite/Services/authServices';
import db from 'src/appwrite/Services/dbServices';
import { Query, Models } from 'appwrite';

interface User {
  id: string;
  name: string;
  isWholesaleApproved: boolean;
  // Add other user-related fields as necessary
}

interface UserContextProps {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  loading: true,
});

export const useUser = () => useContext(UserContext);

interface Props {
  children: ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser: Models.User<Models.Preferences> | null = await getCurrentUser();
        if (currentUser) {
          const userId = currentUser.$id;

          const userDocList = await db.Users.list([
            Query.equal('userId', userId),
          ]);

          if (userDocList.documents.length > 0) {
            const userDoc = userDocList.documents[0];
            setUser({
              id: currentUser.$id,
              name: currentUser.name || '',
              isWholesaleApproved: userDoc.isWholesaleApproved || false,
              // Map other fields as needed
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
