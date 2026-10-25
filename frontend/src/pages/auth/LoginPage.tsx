import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Mail, Lock, ShieldAlert, UserCheck, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'customer@roomly.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      const user = await login(data.email);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/' ? '/customer/dashboard' : from);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setValue('email', 'admin@roomly.com');
      setValue('password', 'adminpass123');
      await login('admin@roomly.com', 'admin');
      navigate('/admin');
    } else {
      setValue('email', 'customer@roomly.com');
      setValue('password', 'password123');
      await login('customer@roomly.com', 'customer');
      navigate('/customer/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Welcome to Roomly
        </h1>
        <p className="text-sm text-on-surface-variant">
          Sign in to your guest account or admin operations portal.
        </p>
      </div>

      {/* Quick Demo Credentials Pill */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
        <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
          <span>⚡ Fast Demo Access:</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('customer')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-xs font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-secondary" />
            Guest Account
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-xs font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            Admin Console
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            label="Remember this device"
            {...register('rememberMe')}
          />
          <a href="#" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="primary"
          className="w-full font-bold shadow-md"
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-on-surface-variant pt-2">
        <span>Don't have a Roomly account yet? </span>
        <Link to="/register" className="font-bold text-primary hover:underline">
          Create guest profile
        </Link>
      </div>
    </div>
  );
};
