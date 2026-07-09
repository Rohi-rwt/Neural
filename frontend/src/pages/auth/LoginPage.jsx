// LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/common/UI';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-gradient text-3xl font-bold mb-2">⚡ NeuralPath</div>
          <p className="text-secondary text-sm">AI-powered learning platform</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold mb-6">Welcome back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center">
              {isLoading ? <LoadingSpinner size={16} /> : 'Sign In →'}
            </button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface" /></div>
            <div className="relative flex justify-center"><span className="bg-surface2 px-3 text-xs text-muted">or continue with</span></div>
          </div>
          <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-outline w-full justify-center text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </a>
          <p className="text-center text-sm text-muted mt-4">
            Don't have an account? <Link to="/register" className="text-accent hover:underline">Sign up free</Link>
          </p>
        </div>
        <p className="text-center text-xs text-muted mt-4">Demo: admin@neuralpath.in / Admin@123</p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-gradient text-3xl font-bold mb-2">⚡ NeuralPath</div>
          <p className="text-secondary text-sm">Start your AI learning journey today</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold mb-6">Create your account</h2>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Arjun Kumar' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { id: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
              { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter password' }
            ].map(f => (
              <div key={f.id}>
                <label className="text-xs text-muted mb-1.5 block">{f.label}</label>
                <input className="input" type={f.type} placeholder={f.placeholder} value={form[f.id]} onChange={e => { setError(''); setForm(p => ({ ...p, [f.id]: e.target.value })); }} required />
              </div>
            ))}
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center mt-2">
              {isLoading ? <LoadingSpinner size={16} /> : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-4">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-xs text-muted mt-3">By signing up, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-gradient text-3xl font-bold mb-2">⚡ NeuralPath</div>
        </div>
        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-lg font-bold mb-2">Check your email</h2>
              <p className="text-sm text-secondary">We've sent a reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn-primary mt-4 mx-auto w-fit">← Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-2">Reset your password</h2>
              <p className="text-sm text-secondary mb-6">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <LoadingSpinner size={16} /> : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-muted mt-4">
                <Link to="/login" className="text-accent hover:underline">← Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuthStore();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Decode user from token (in production, fetch /auth/me)
      loginWithToken(token, { name: 'User', email: '', role: 'user', xp: 0, level: 1, streak: 0, subscription: { plan: 'free' } });
      navigate('/dashboard');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={32} className="mx-auto mb-4" />
        <p className="text-secondary">Signing you in...</p>
      </div>
    </div>
  );
}

export default LoginPage;
