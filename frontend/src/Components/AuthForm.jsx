import { motion } from 'framer-motion';
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

function AuthForm({
  type,
  onSubmit,
  submitLabel,
  footerText,
  footerLink,
  footerLinkText,
  loading,
  errors = {},
  successMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    rememberMe: false,
  });

  const handleChange = (event) => {
    const { name, value, type: inputType, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (type === 'register') {
      onSubmit({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: formData.agreeToTerms,
      });
      return;
    }

    onSubmit({ email: formData.email, password: formData.password, rememberMe: formData.rememberMe });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit}
      className="auth-form"
    >
      {successMessage && <div className="auth-form__success">{successMessage}</div>}

      {type === 'register' && (
        <div className="auth-field">
          <label htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Alex Morgan"
            value={formData.full_name}
            onChange={handleChange}
          />
          {errors.full_name && <p className="auth-form__error">{errors.full_name}</p>}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="auth-form__error">{errors.email}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <div className="auth-field__input">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="button" className="auth-field__toggle" onClick={() => setShowPassword((current) => !current)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="auth-form__error">{errors.password}</p>}
      </div>

      {type === 'register' && (
        <div className="auth-field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="auth-field__input">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button type="button" className="auth-field__toggle" onClick={() => setShowConfirmPassword((current) => !current)}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="auth-form__error">{errors.confirmPassword}</p>}
        </div>
      )}

      {type === 'register' && (
        <label className="auth-checkbox">
          <input name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange} />
          <span>I agree to the Terms &amp; Privacy Policy</span>
        </label>
      )}

      {type === 'login' && (
        <div className="auth-row">
          <label className="auth-checkbox">
            <input name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} />
            <span>Remember me</span>
          </label>
          <a className="auth-link" href="/forgot-password">Forgot password?</a>
        </div>
      )}

      {errors.form && <p className="auth-form__error">{errors.form}</p>}

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? <LoaderCircle size={18} className="auth-spinner" /> : <ShieldCheck size={18} />}
        {loading ? 'Working...' : submitLabel}
      </button>

      <p className="auth-footer">
        {footerText}{' '}
        <a href={footerLink}>{footerLinkText}</a>
      </p>
    </motion.form>
  );
}

export default AuthForm;
