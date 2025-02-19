import Input from '@components/ui/form/input';
import Button from '@components/ui/button';
import TextArea from '@components/ui/form/text-area';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import db from 'src/appwrite/Services/dbServices';
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        comment: values.message, // Assuming the field is 'comment' in your schema
        read: false, // Set 'read' status to false initially
      };
      await db.contacts.create(payload);
      // Display success toast
      toast.success('Your message has been sent successfully!');
      reset();
    } catch (error) {
      console.error('Error storing contact:', error);
      // Display error toast
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Input
        variant="solid"
        label={t('forms:label-name-required')}
        placeholder={t('forms:placeholder-name')}
        {...register('name', {
          required: {
            value: true,
            message: t('forms:name-required') || 'Name is required',
          },
        })}
        error={errors.name?.message}
      />
      <Input
        type="email"
        variant="solid"
        label={t('forms:label-email-required')}
        placeholder={t('forms:placeholder-email')}
        {...register('email', {
          required: {
            value: true,
            message: t('forms:email-required') || 'Email is required',
          },
          pattern: {
            value:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: t('forms:email-error') || 'Invalid email address',
          },
        })}
        error={errors.email?.message}
      />
      <Input
        variant="solid"
        type="text"
        label={t('forms:label-contact-phone')}
        placeholder={t('forms:placeholder-phone')}
        {...register('phone')}
        error={errors.phone?.message}
      />
      <TextArea
        variant="solid"
        label={t('forms:label-message')}
        {...register('message')}
        placeholder={t('forms:placeholder-briefly-describe')}
        error={errors.message?.message}
      />
      <Button variant="formButton" className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending Message...' : 'Send Message'}
      </Button>
    </form>
  );
};

export default ContactForm;
