import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import AuthForm from '../Components/AuthForm';

function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (values) => {
    const nextErrors = {};

    if (!values.full_name?.trim()) {
      nextErrors.full_name = 'Full name is required.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Please enter a valid email.';
    }

    if (values.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!values.agreeToTerms) {
      nextErrors.form = 'You must accept the terms and privacy policy.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register({
        full_name: values.full_name.trim(),
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Unable to create your account.';
      const validationErrors = error.response?.data?.errors || [];
      const parsedErrors = validationErrors.reduce((accumulator, item) => {
        accumulator[item.field] = item.message;
        return accumulator;
      }, {});

      setErrors({
        ...parsedErrors,
        form: serverMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-subtitle">Open your StockScope workspace with a secure profile.</p>
      <AuthForm
        type="register"
        onSubmit={handleSubmit}
        submitLabel="Create Account"
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Sign in"
        loading={loading}
        errors={errors}
      />
    </motion.div>
  );
}

export default RegisterPage;
