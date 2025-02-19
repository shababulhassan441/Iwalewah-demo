import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@components/ui/button';
import Input from '@components/ui/form/input';
import Heading from '@components/ui/heading';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { getCurrentUser } from 'src/appwrite/Services/authServices';
import db from 'src/appwrite/Services/dbServices';
import { ID, Models, Query } from 'appwrite';

interface UserDocument {
  $id: string;
  userId: string;
  role: 'user' | 'admin';
  name: string;
  isWholesaleApproved: boolean;
  telephone: string;
}

interface UpdateUserType {
  name: string;
  phoneNumber: string;
}

const AccountDetails: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserType>({
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/');
        return;
      }

      try {
        const userDocList = await db.Users.list([
          Query.equal('userId', user.$id),
        ]);

        if (userDocList.documents.length > 0) {
          const fetchedUserDoc:any = userDocList.documents[0];
          setUserDoc(fetchedUserDoc);
          reset({
            name: fetchedUserDoc.name || '',
            phoneNumber: fetchedUserDoc.telephone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage(t('common:text-fetch-error') as string);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [reset, router, t]);

  const onSubmit = async (input: UpdateUserType) => {
    if (!userDoc) return;

    const updatedData = {
      name: input.name,
      telephone: input.phoneNumber,
    };

    try {
      await db.Users.update(userDoc.$id, updatedData);
      setSuccessMessage("Updated Successfully !");
      setErrorMessage(null);
      
      // Optionally, refetch user data to ensure the latest data is displayed
      const updatedUserDoc = await db.Users.get(userDoc.$id);
      setUserDoc(updatedUserDoc as any);
      
      // Optionally, reset the form with updated data
      reset({
        name: updatedUserDoc.name || '',
        phoneNumber: updatedUserDoc.telephone || '',
      });

      // Auto-dismiss the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Error updating user data:', error);
      setErrorMessage(t('common:text-update-error') as string);
      setSuccessMessage(null);

      // Auto-dismiss the error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  if (isFetching) {
    return <div>{t('common:text-loading')}</div>; // Replace with a loading spinner if desired
  }

  return (
    <div className="flex flex-col w-full">
      <Heading variant="titleLarge" className="mb-5 md:mb-6 lg:mb-7 lg:-mt-1">
        {t('common:text-account-details-personal')}
      </Heading>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 border border-green-400 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center w-full mx-auto"
        noValidate
      >
        <div className="border-b border-border-base pb-7 md:pb-8 lg:pb-10">
          <div className="flex flex-col space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
              <Input
                label={t('forms:label-name')}
                {...register('name', {
                  required: t('forms:name-required') as string,
                })}
                variant="solid"
                className="w-full px-1.5 md:px-2.5"
                error={errors.name?.message}
              />
            </div>
            <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
              <Input
                type="tel"
                label={t('forms:label-phone')}
                {...register('phoneNumber', {
                  required: t('forms:phone-required') as string,
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: t('forms:phone-invalid'),
                  },
                })}
                variant="solid"
                className="w-full px-1.5 md:px-2.5"
                error={errors.phoneNumber?.message}
              />
            </div>
          </div>
        </div>

        <div className="relative flex pb-2 mt-5 sm:ltr:ml-auto sm:rtl:mr-auto lg:pb-0">
          <Button
            type="submit"
            loading={isFetching}
            disabled={isFetching}
            variant="formButton"
            className="w-full sm:w-auto"
          >
            {t('common:button-save-changes')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetails;
