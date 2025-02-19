// pages/wholesale-request.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import Button from '@components/ui/button';
import Heading from '@components/ui/heading';
import Input from '@components/ui/form/input';
import TextArea from '@components/ui/form/text-area';
import { Checkbox } from '@components/ui/form/checkbox';
import { getCurrentUser } from 'src/appwrite/Services/authServices';
import db from 'src/appwrite/Services/dbServices';
import storageServices from 'src/appwrite/Services/storageServices';
import { Query, ID } from 'appwrite';
import { toast } from 'react-toastify';
import { ROUTES } from '@utils/routes';
import Dropzone from 'react-dropzone';
import dynamic from 'next/dynamic';

// Dynamically import ReCAPTCHA to prevent SSR issues
const ReCAPTCHA: any = dynamic(() => import('react-google-recaptcha'), { ssr: false });

// Utility class to handle FileList items
class FileListItems {
  files: FileList;
  constructor(files: FileList, index: number) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(files[index]);
    this.files = dataTransfer.files;
  }
}

interface WholesaleRequestFormValues {
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  accountType: 'personal' | 'business';
  tradingName?: string;
  tradingAddress?: string;
  sameAsAbove?: boolean;
  companyRegisteredName?: string;
  companyRegistrationNumber?: string;
  positionInBusiness?: string;
  businessDescription?: string;
  vatNumber?: string;
  vatNotRegistered?: boolean; // Keep for form handling
  businessType: string;
  otherBusinessType?: string;
  marketingPreferences: boolean;
  acceptedTerms: boolean; // Keep for form handling
  photoId?: FileList;
  utilityBill?: FileList;
  otherDocuments?: FileList;
  recaptchaToken?: string | null; // Add recaptchaToken to form values
}

interface WholesaleRequestDocument {
  $id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  accountType: 'personal' | 'business';
  tradingName?: string;
  tradingAddress?: string;
  companyRegisteredName?: string;
  companyRegistrationNumber?: string;
  positionInBusiness?: string;
  businessDescription?: string;
  vatNumber: string;
  businessType: string;
  attachments?: string[];
  marketingPreferences: boolean;
  // Exclude vatNotRegistered and acceptedTerms as they are not in the schema
}

// Function to create FileList from an array of Files
function createFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach(file => dt.items.add(file));
  return dt.files;
}

const WholesaleRequest: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [existingRequest, setExistingRequest] = useState<WholesaleRequestDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for image previews
  const [photoIdPreview, setPhotoIdPreview] = useState<string | null>(null);
  const [utilityBillPreview, setUtilityBillPreview] = useState<string | null>(null);
  const [otherDocumentsPreviews, setOtherDocumentsPreviews] = useState<string[]>([]);

  // State to hold reCAPTCHA token and server errors
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize react-hook-form with setValue
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WholesaleRequestFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      mobileNumber: '',
      accountType: 'personal',
      marketingPreferences: true,
      acceptedTerms: false,
    },
  });

  const watchAccountType = watch('accountType');
  const watchSameAsAbove = watch('sameAsAbove');
  const watchVatNotRegistered = watch('vatNotRegistered');
  const watchBusinessType = watch('businessType');

  const otherDocuments = useWatch({ control, name: 'otherDocuments' });

  useEffect(() => {
    const fetchUserAndRequest = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          // Fetch the wholesale request for the user
          const existingRequests = await db.WholesaleAccountRequests.list([
            Query.equal('userId', currentUser.$id),
          ]);

          if (existingRequests.documents.length > 0) {
            const request = existingRequests.documents[0] as any;
            setExistingRequest(request);

            if (request.status === 'rejected') {
              // If the request was rejected, show the rejection reason
              setRejectionReason(request.rejectionReason || '');
            }

            // Fetch and set image previews
            if (request.attachments && request.attachments.length >= 2) {
              const photoIdUrl = await storageServices['images'].getFilePreview(request.attachments[0]);
              const utilityBillUrl = await storageServices['images'].getFilePreview(request.attachments[1]);
              setPhotoIdPreview(photoIdUrl.href);
              setUtilityBillPreview(utilityBillUrl.href);

              if (request.attachments.length > 2) {
                const otherDocsUrls = await Promise.all(
                  request.attachments.slice(2).map((fileId: string) =>
                    storageServices['images'].getFilePreview(fileId)
                  )
                );
                setOtherDocumentsPreviews(otherDocsUrls.map(url => url.href));
              }
            }
          }
        } else {
          router.push(ROUTES.LOGIN); // Redirect to login if not authenticated
          return;
        }
      } catch (error) {
        console.error('Error fetching user or request:', error);
        router.push(ROUTES.LOGIN);
        return;
      } finally {
        setIsFetching(false);
      }
    };
    fetchUserAndRequest();
  }, [router]);

  // Handle reCAPTCHA change
  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  // Function to verify reCAPTCHA token with your server
  const verifyRecaptcha = async (token: string) => {
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.json();
  };

  const onSubmit = async (data: WholesaleRequestFormValues) => {
    setIsLoading(true);
    setServerError(null); // Reset server error before submission
    try {
      if (!user) {
        toast.error('Please log in to submit a wholesale request.');
        router.push(ROUTES.LOGIN);
        return;
      }

      if (!recaptchaToken) {
        setServerError('Please verify that you are not a robot.');
        return;
      }

      // Send the reCAPTCHA token to your server for verification
      const verificationResponse = await verifyRecaptcha(recaptchaToken);

      if (!verificationResponse.success) {
        setServerError('reCAPTCHA verification failed. Please try again.');
        return;
      }

      // Handle file uploads
      const uploadedFiles: string[] = [];

      const uploadFile = async (fileList: FileList | undefined) => {
        if (fileList && fileList.length > 0) {
          const file = fileList[0];
          try {
            // Replace 'images' with the appropriate bucket name if different
            const uploadedFile = await storageServices['images'].createFile(file);
            uploadedFiles.push(uploadedFile.$id);
          } catch (error) {
            console.error(`Error uploading file:`, error);
            throw error;
          }
        }
      };

      // Upload photoId and utilityBill
      await uploadFile(data.photoId);
      await uploadFile(data.utilityBill);

      // Upload otherDocuments if any
      if (data.otherDocuments && data.otherDocuments.length > 0) {
        for (let i = 0; i < data.otherDocuments.length; i++) {
          const singleFile = new FileListItems(data.otherDocuments, i).files;
          await uploadFile(singleFile);
        }
      }

      const attachments = uploadedFiles;

      // Prepare marketingPreferences as boolean
      const marketingPreferences = data.marketingPreferences;

      // Adjust vatNumber handling
      const vatNumber = data.vatNotRegistered ? 'Not VAT registered' : data.vatNumber || '';

      // Adjust businessType handling
      const businessType =
        data.businessType === 'Other' && data.otherBusinessType
          ? `Other: ${data.otherBusinessType}`
          : data.businessType;

      const requestData: Omit<WholesaleRequestDocument, '$id' | 'vatNotRegistered' | 'acceptedTerms'> = {
        userId: user.$id,
        status: 'pending',
        rejectionReason: '',
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        mobileNumber: data.mobileNumber || '',
        accountType: data.accountType,
        tradingName: data.accountType === 'business' ? data.tradingName || '' : '',
        tradingAddress:
          data.accountType === 'business'
            ? data.sameAsAbove
              ? data.address
              : data.tradingAddress || ''
            : '',
        companyRegisteredName: data.accountType === 'business' ? data.companyRegisteredName || '' : '',
        companyRegistrationNumber:
          data.accountType === 'business' ? data.companyRegistrationNumber || '' : '',
        positionInBusiness: data.accountType === 'business' ? data.positionInBusiness || '' : '',
        businessDescription: data.accountType === 'business' ? data.businessDescription || '' : '',
        vatNumber: data.accountType === 'business' ? vatNumber : '',
        businessType: data.accountType === 'business' ? businessType : '',
        // Note: otherBusinessType is used in constructing businessType, so it's not needed separately
        marketingPreferences: marketingPreferences,
        // Remove acceptedTerms as it's not part of the schema
        attachments: attachments,
      };

      let updatedRequest;

      if (existingRequest) {
        // Update the existing wholesale request document
        updatedRequest = await db.WholesaleAccountRequests.update(existingRequest.$id, requestData);
        toast.success('Your wholesale request has been resubmitted successfully.');
      } else {
        // Create a new wholesale request document
        const uniqueId = ID.unique();
        updatedRequest = await db.WholesaleAccountRequests.create(requestData as any, uniqueId);
        toast.success('Your wholesale request has been submitted successfully.');
      }

      setExistingRequest(updatedRequest as any);
      setRejectionReason(null);
      setRecaptchaToken(null); // Reset reCAPTCHA after successful submission
    } catch (error: any) {
      console.error('Error submitting wholesale request:', error);
      setServerError('An error occurred while submitting your request. Please try again.');
      toast.error('An error occurred while submitting your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to display status message
  const renderStatusMessage = () => {
    if (!existingRequest) return null;

    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'pending':
          return {
            bgColor: 'bg-amber-50 border-amber-200',
            textColor: 'text-amber-800',
            icon: (
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          };
        case 'approved':
          return {
            bgColor: 'bg-green-50 border-green-200',
            textColor: 'text-green-800',
            icon: (
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          };
        case 'rejected':
          return {
            bgColor: 'bg-red-50 border-red-200',
            textColor: 'text-red-800',
            icon: (
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          };
        default:
          return {
            bgColor: 'bg-gray-50 border-gray-200',
            textColor: 'text-gray-800',
            icon: null
          };
      }
    };

    const statusConfig = getStatusConfig(existingRequest.status);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Status Alert */}
          <div className={`flex items-center p-4 rounded-lg border ${statusConfig.bgColor}`}>
            <div className="flex-shrink-0">{statusConfig.icon}</div>
            <div className="ml-3 flex items-center">
              <h2 className="text-sm font-medium mr-2">Application Status:</h2>
              <span className={`text-sm font-semibold capitalize ${statusConfig.textColor}`}>
                {existingRequest.status}
              </span>
            </div>
          </div>

          {/* Admin Comment Section */}
          {existingRequest.rejectionReason && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center mb-3">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h2 className="text-sm font-medium text-gray-900">Comment</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {existingRequest.rejectionReason}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Cleanup object URLs to prevent memory leaks
    return () => {
      if (photoIdPreview) URL.revokeObjectURL(photoIdPreview);
      if (utilityBillPreview) URL.revokeObjectURL(utilityBillPreview);
      otherDocumentsPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [photoIdPreview, utilityBillPreview, otherDocumentsPreviews]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Heading variant="titleLarge">Wholesale Account Application</Heading>
      <div className="w-full flex h-full lg:w-10/12 2xl:w-9/12 flex-col mt-6 lg:mt-7">
        {existingRequest && existingRequest.status !== 'rejected' ? (
          renderStatusMessage()
        ) : (
          <>
            {existingRequest && <div className="mb-6">{renderStatusMessage()}</div>}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full mx-auto flex flex-col justify-center"
              noValidate
            >
              <div className="flex flex-col space-y-5 lg:space-y-7">
                {/* Display Server Error */}
                {serverError && (
                  <div className="mb-4 text-red-600 text-sm">
                    {serverError}
                  </div>
                )}

                {/* YOUR DETAILS */}
                <h2 className="text-xl font-semibold">Your Details</h2>
                <Input
                  label="First Name*"
                  {...register('firstName', { required: 'First name is required.' })}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Last Name*"
                  {...register('lastName', { required: 'Last name is required.' })}
                  error={errors.lastName?.message}
                />
                <h2 className="text-xl font-semibold">Personal Address Details</h2>
                <TextArea
                  label="Full Address* (including Postcode & County)"
                  {...register('address', { required: 'Address is required.' })}
                  error={errors.address?.message}
                />
                <Input
                  label="Mobile Number"
                  {...register('mobileNumber')}
                  error={errors.mobileNumber?.message}
                />
                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                    Account Type*
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="personal"
                        {...register('accountType')}
                        className="form-radio"
                        defaultChecked
                      />
                      <span className="ml-2">Personal</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="business"
                        {...register('accountType')}
                        className="form-radio"
                      />
                      <span className="ml-2">Business</span>
                    </label>
                  </div>
                  {errors.accountType && (
                    <p className="text-red-500 text-sm mt-1">{errors.accountType.message}</p>
                  )}
                </div>

                {/* BUSINESS DETAILS - Conditionally Rendered */}
                {watchAccountType === 'business' && (
                  <>
                    <h2 className="text-xl font-semibold">Business Details</h2>
                    <Input
                      label="Trading Name*"
                      {...register('tradingName', { required: 'Trading name is required.' })}
                      error={errors.tradingName?.message}
                    />
                    <Checkbox
                      label="Trading address same as above"
                      {...register('sameAsAbove')}
                    />
                    {!watchSameAsAbove && (
                      <TextArea
                        label="Trading Address*"
                        {...register('tradingAddress', {
                          required: 'Trading address is required.',
                        })}
                        error={errors.tradingAddress?.message}
                      />
                    )}
                    <Input
                      label="Company Registered Name*"
                      {...register('companyRegisteredName', {
                        required: 'Company registered name is required.',
                      })}
                      error={errors.companyRegisteredName?.message}
                    />
                    <Input
                      label="Company Registration Number (if you have one)"
                      {...register('companyRegistrationNumber')}
                      error={errors.companyRegistrationNumber?.message}
                    />
                    <Input
                      label="Position in Business*"
                      {...register('positionInBusiness', {
                        required: 'Position in business is required.',
                      })}
                      error={errors.positionInBusiness?.message}
                    />
                    <TextArea
                      label="Business Description*"
                      {...register('businessDescription', {
                        required: 'Business description is required.',
                      })}
                      error={errors.businessDescription?.message}
                    />
                    <Checkbox
                      label="I'm not VAT registered"
                      {...register('vatNotRegistered')}
                    />
                    {!watchVatNotRegistered && (
                      <Input
                        label="VAT Number*"
                        {...register('vatNumber', {
                          required: 'VAT number is required unless not registered.',
                        })}
                        error={errors.vatNumber?.message}
                      />
                    )}
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                        Business Type*
                      </label>
                      <select
                        id="businessType"
                        {...register('businessType', { required: 'Business type is required.' })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select Business Type</option>
                        <option value="Export">Export</option>
                        <option value="Retail">Retail</option>
                        <option value="Catering">Catering</option>
                        <option value="On-trade">On-trade</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.businessType && <p className="mt-2 text-sm text-red-600">{errors.businessType.message}</p>}
                    </div>
                    {watchBusinessType === 'Other' && (
                      <Input
                        label="Please specify your business type*"
                        {...register('otherBusinessType', {
                          required: 'Please specify your business type.',
                        })}
                        error={errors.otherBusinessType?.message}
                      />
                    )}
                  </>
                )}

                {/* Upload Documents with Image Previews */}
                <h2 className="text-xl font-semibold">Upload Documents</h2>

                {/* Photo ID */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="photoId">
                    Proof of Photo ID*
                  </label>
                  <Controller
                    name="photoId"
                    control={control}
                    rules={{ required: 'Please upload your photo ID.' }}
                    render={({ field }) => (
                      <Dropzone
                        onDrop={(acceptedFiles) => {
                          field.onChange(acceptedFiles);
                          if (acceptedFiles && acceptedFiles.length > 0) {
                            const preview = URL.createObjectURL(acceptedFiles[0]);
                            setPhotoIdPreview(preview);
                          }
                        }}
                        multiple={false}
                        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.pdf'] }}
                      >
                        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                          <div
                            {...getRootProps()}
                            className={`mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
                              isDragActive ? 'border-indigo-500' : ''
                            } ${isDragReject ? 'border-red-500' : ''}`}
                          >
                            <input {...getInputProps()} className="sr-only" />
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8z"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M28 8v12h12"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                  <span>Upload a file</span>
                                </span>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </Dropzone>
                    )}
                  />
                  {errors.photoId && <p className="text-red-500 text-sm mt-1">{errors.photoId.message}</p>}
                  {photoIdPreview && (
                    <div className="mt-2 relative">
                      {photoIdPreview.endsWith('.pdf') ? (
                        <div className="flex items-center">
                          <svg
                            className="h-8 w-8 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l6 3m-6-3l-6 3"
                            />
                          </svg>
                          <span className="ml-2">PDF Document Uploaded</span>
                        </div>
                      ) : (
                        <img
                          src={photoIdPreview}
                          alt="Photo ID Preview"
                          className="h-32 w-auto object-cover rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        onClick={() => {
                          setPhotoIdPreview(null);
                          setValue('photoId', undefined);
                        }}
                        aria-label="Remove Photo ID"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Utility Bill */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="utilityBill">
                    Utility Bill
                  </label>
                  <Controller
                    name="utilityBill"
                    control={control}
                    render={({ field }) => (
                      <Dropzone
                        onDrop={(acceptedFiles) => {
                          field.onChange(acceptedFiles);
                          if (acceptedFiles && acceptedFiles.length > 0) {
                            const preview = URL.createObjectURL(acceptedFiles[0]);
                            setUtilityBillPreview(preview);
                          }
                        }}
                        multiple={false}
                        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.pdf'] }}
                      >
                        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                          <div
                            {...getRootProps()}
                            className={`mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
                              isDragActive ? 'border-indigo-500' : ''
                            } ${isDragReject ? 'border-red-500' : ''}`}
                          >
                            <input {...getInputProps()} className="sr-only" />
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8z"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M28 8v12h12"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                  <span>Upload a file</span>
                                </span>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </Dropzone>
                    )}
                  />
                  {errors.utilityBill && <p className="text-red-500 text-sm mt-1">{errors.utilityBill.message}</p>}
                  {utilityBillPreview && (
                    <div className="mt-2 relative">
                      {utilityBillPreview.endsWith('.pdf') ? (
                        <div className="flex items-center">
                          <svg
                            className="h-8 w-8 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l6 3m-6-3l-6 3"
                            />
                          </svg>
                          <span className="ml-2">PDF Document Uploaded</span>
                        </div>
                      ) : (
                        <img
                          src={utilityBillPreview}
                          alt="Utility Bill Preview"
                          className="h-32 w-auto object-cover rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        onClick={() => {
                          setUtilityBillPreview(null);
                          setValue('utilityBill', undefined);
                        }}
                        aria-label="Remove Utility Bill"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Other Documents */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="otherDocuments">
                    Other Documents
                  </label>
                  <Controller
                    name="otherDocuments"
                    control={control}
                    render={({ field }) => (
                      <Dropzone
                        onDrop={(acceptedFiles) => {
                          field.onChange(acceptedFiles);
                          const previews = acceptedFiles.map(file => URL.createObjectURL(file));
                          setOtherDocumentsPreviews(previews);
                        }}
                        multiple={true}
                        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.pdf'] }}
                      >
                        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                          <div
                            {...getRootProps()}
                            className={`mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
                              isDragActive ? 'border-indigo-500' : ''
                            } ${isDragReject ? 'border-red-500' : ''}`}
                          >
                            <input {...getInputProps()} className="sr-only" />
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8z"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M28 8v12h12"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                  <span>Upload files</span>
                                </span>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </Dropzone>
                    )}
                  />
                  {errors.otherDocuments && <p className="text-red-500 text-sm mt-1">{errors.otherDocuments.message}</p>}
                  {otherDocumentsPreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {otherDocumentsPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          {preview.endsWith('.pdf') ? (
                            <div className="flex items-center">
                              <svg
                                className="h-8 w-8 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l6 3m-6-3l-6 3"
                                />
                              </svg>
                              <span className="ml-2">PDF Document Uploaded</span>
                            </div>
                          ) : (
                            <img
                              src={preview}
                              alt={`Other Document ${index + 1}`}
                              className="h-32 w-auto object-cover rounded-md"
                            />
                          )}
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            onClick={() => {
                              // Remove the specific file preview
                              setOtherDocumentsPreviews(prev => prev.filter((_, i) => i !== index));
                              // Reset the field value accordingly
                              const newFiles = Array.from(otherDocuments || []);
                              newFiles.splice(index, 1);
                              setValue('otherDocuments', newFiles.length > 0 ? createFileList(newFiles) : undefined);
                            }}
                            aria-label={`Remove Other Document ${index + 1}`}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COMMUNICATION PREFERENCES */}
                <h2 className="text-xl font-semibold">Communication Preferences</h2>
                <div className="flex items-center">
                  <Checkbox
                    label="I agree to receive promotional communications."
                    {...register('marketingPreferences')}
                  />
                </div>

                {/* Accept Terms */}
                <div className="flex items-center">
                  <Checkbox
                    label="I accept the Terms & Conditions*"
                    {...register('acceptedTerms', {
                      required: 'You must accept the Terms & Conditions.',
                    })}
                  />
                  {errors.acceptedTerms && (
                    <p className="text-red-500 text-sm mt-1">{errors.acceptedTerms.message}</p>
                  )}
                </div>

                {/* Add reCAPTCHA here */}
                <div className="flex  mt-4">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={onRecaptchaChange}
                    // @ts-ignore
                  />
                </div>
                {errors.recaptchaToken && (
                  <p className="text-red-500 text-sm mt-1">{errors.recaptchaToken.message}</p>
                )}
                {serverError && (
                  <p className="text-red-500 text-sm mt-1">{serverError}</p>
                )}

                {/* Submit Button */}
                <div className="relative mt-3">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                    variant="formButton"
                    className="w-full sm:w-auto"
                  >
                    {existingRequest ? 'Resubmit Request' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default WholesaleRequest;
