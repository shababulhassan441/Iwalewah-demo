// components/common/modal/ManagedModal.tsx

import Modal from '@components/common/modal/modal';
import dynamic from 'next/dynamic';
import {
  useModalAction,
  useModalState,
} from '@components/common/modal/modal.context';

// Dynamic imports for modal content components
const LoginForm :any= dynamic(() => import('@components/auth/login-form'));
const SignUpForm :any = dynamic(() => import('@components/auth/sign-up-form'));
const ForgetPasswordForm :any = dynamic(
  () => import('@components/auth/forget-password-form')
);
const ProductPopup :any = dynamic(() => import('@components/product/product-popup'));
const AddressPopup :any = dynamic(
  () => import('@components/common/form/add-address')
);
const PaymentPopup :any = dynamic(
  () => import('@components/common/form/add-payment')
);
const PhoneNumberPopup :any = dynamic(
  () => import('@components/common/form/add-contact')
);
const DeliveryAddresses :any  = dynamic(
  () => import('@components/address/delivery-addresses')
);
const CategoryPopup :any = dynamic(
  () => import('@components/category/category-popup')
);
const ResetPasswordForm :any = dynamic(
  () => import('@components/auth/reset-password')
); // Dynamic import for ResetPasswordForm
const ManagedModal: React.FC = () => {
  const { isOpen, view, data } = useModalState();
  const { closeModal } = useModalAction();

  if (!isOpen || !view) return null;

  // Determine if a specific variant is needed
  const isCategoryView = view === 'CATEGORY_VIEW';
  const variant = isCategoryView ? 'bottom' : undefined;

  return (
    <Modal open={isOpen} onClose={closeModal} variant={variant}>
      {view === 'LOGIN_VIEW' && <LoginForm />}
      {view === 'SIGN_UP_VIEW' && <SignUpForm />}
      {view === 'FORGET_PASSWORD' && <ForgetPasswordForm />}
      {view === 'RESET_PASSWORD' && (
        <ResetPasswordForm
          recoveryId={data?.recoveryId}
          userId={data?.userId}
        />
      )}
      {view === 'PRODUCT_VIEW' && <ProductPopup />}
      {view === 'ADDRESS_VIEW_AND_EDIT' && <AddressPopup />}
      {view === 'PAYMENT' && <PaymentPopup />}
      {view === 'PHONE_NUMBER' && <PhoneNumberPopup />}
      {view === 'DELIVERY_VIEW' && <DeliveryAddresses />}
      {view === 'CATEGORY_VIEW' && <CategoryPopup />}
      {/* Add more modal views as needed */}
    </Modal>
  );
};

export default ManagedModal;
