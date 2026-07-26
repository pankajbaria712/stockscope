import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import AuthForm from '../Components/AuthForm';

function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrors({});

    try {
      await login(values);
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Unable to sign you in right now.';
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
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Sign in to continue your research workflow.</p>
      <AuthForm
        type="login"
        onSubmit={handleSubmit}
        submitLabel="Sign In"
        footerText="New to StockScope?"
        footerLink="/register"
        footerLinkText="Create account"
        loading={loading}
        errors={errors}
      />
    </motion.div>
  );
}

export default LoginPage;
