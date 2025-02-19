// hooks/use-logout.ts

import { useUI } from '@contexts/ui.context';
import Router from 'next/router';
import { useMutation } from 'react-query';
import { signOutUser } from 'src/appwrite/Services/authServices';
import Cookies from 'js-cookie'; // Only if you have client-side tokens to remove

export const useLogoutMutation = () => {
  const { unauthorize } = useUI();

  return useMutation<void, Error, void>(
    async () => {
      await signOutUser();
    },
    {
      onSuccess: () => {
        // Remove any client-side tokens if you have them
        Cookies.remove('auth_token'); // Adjust if you use different token names

        // Update the UI context to reflect the user is unauthorized
        unauthorize();

        // Redirect the user to the homepage or any other page
        window.location.href = '/';
        return;
      },
      onError: (error) => {
        console.error('Logout Error:', error);
        // Optionally, display an error notification to the user
      },
    }
  );
};
