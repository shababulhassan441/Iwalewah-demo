// src/hooks/useWholesaleValidation.ts

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'src/appwrite/Services/authServices';
import db from 'src/appwrite/Services/dbServices';
import { Query, Models } from 'appwrite';

const useWholesaleValidation = () => {
  const router = useRouter();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const currentUser: Models.User<Models.Preferences> | null = await getCurrentUser();
        if (currentUser) {
          const userId = currentUser.$id;

          const userDocList = await db.Users.list([
            Query.equal('userId', userId),
          ]);

          if (userDocList.documents.length > 0) {
            const userDoc = userDocList.documents[0];
            if (userDoc.isWholesaleApproved) {
              setIsValid(true);
              return;
            }
          }
        }
        // If validation fails
        setIsValid(false);
        router.replace('/404');
      } catch (error) {
        console.error('Error validating wholesale access:', error);
        setIsValid(false);
        router.replace('/404');
      }
    };

    validateUser();
  }, [router]);

  return isValid;
};

export default useWholesaleValidation;
