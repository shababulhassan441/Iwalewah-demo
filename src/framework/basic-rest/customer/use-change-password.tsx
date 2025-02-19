// @framework/customer/use-change-password.ts

import { useMutation } from 'react-query';
import { changePassword } from 'src/appwrite/Services/authServices';
export interface ChangePasswordInputType {
  oldPassword: string;
  newPassword: string;
}

export const useChangePasswordMutation = () => {
  return useMutation(
    (input: ChangePasswordInputType) =>
      changePassword(input.oldPassword, input.newPassword),
    {
      onSuccess: () => {
        console.log('ChangePassword success response');
        // Optionally, you can add more success handling here, such as redirecting the user or showing a success message.
      },
      onError: (error: any) => {
        console.error('ChangePassword error response', error);
        // Optionally, you can handle errors more gracefully here.
      },
    }
  );
};
