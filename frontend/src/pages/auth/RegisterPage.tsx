import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Mail, Lock, User, Phone, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms & privacy policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      await authRegister(fullName, data.email);
      navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Privilege Membership Included
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Create Guest Profile
        </h1>
        <p className="text-sm text-on-surface-variant">
          Enjoy express bookings, member rates, and tailored concierge privileges.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Sarah"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Jenkins"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="sarah.jenkins@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mobile Phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <div className="pt-2">
          <Checkbox
            label={
              <span className="text-xs text-on-surface-variant">
                I agree to the <a href="#" className="text-primary font-semibold underline">Terms of Hospitality</a> and acknowledge the <a href="#" className="text-primary font-semibold underline">Privacy Statement</a>.
              </span>
            }
            error={errors.agreeTerms?.message}
            {...register('agreeTerms')}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          variant="primary"
          className="w-full font-bold shadow-md"
          isLoading={isSubmitting}
        >
          Complete Registration
        </Button>
      </form>

      <div className="text-center text-xs text-on-surface-variant pt-2">
        <span>Already have an account? </span>
        <Link to="/login" className="font-bold text-primary hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
};
