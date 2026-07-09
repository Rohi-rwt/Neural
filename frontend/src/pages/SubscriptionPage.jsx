import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/common/UI';
import toast from 'react-hot-toast';

const FREE_FEATURES = [
  { f: '30 AI Tutor queries/day', included: true },
  { f: '50 practice problems', included: true },
  { f: '2 mock tests per week', included: true },
  { f: 'Basic progress tracking', included: true },
  { f: 'DSA Visualizer', included: true },
  { f: 'Community access', included: true },
  { f: 'Unlimited AI Tutor', included: false },
  { f: 'AI test generation', included: false },
  { f: 'Advanced analytics', included: false },
  { f: 'Interview simulator', included: false }
];

const PRO_FEATURES = [
  { f: 'Unlimited AI Tutor queries', included: true },
  { f: 'All 500+ problems', included: true },
  { f: 'Unlimited mock tests', included: true },
  { f: 'AI-generated roadmaps', included: true },
  { f: 'AI test generation', included: true },
  { f: 'Advanced analytics', included: true },
  { f: 'Interview simulator', included: true },
  { f: '90-day FAANG roadmap', included: true },
  { f: 'Priority AI support', included: true },
  { f: 'Resume builder', included: true }
];

export default function SubscriptionPage() {
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuthStore();

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionAPI.plans().then(r => r.data.plans)
  });

  const isPro = user?.subscription?.plan === 'pro' || user?.subscription?.plan === 'enterprise';

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.createOrder({ plan: 'pro', billing });
      const { order } = res.data;

      // Razorpay checkout
      if (window.Razorpay && order?.id) {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'NeuralPath Pro',
          description: `Pro ${billing} subscription`,
          order_id: order.id,
          handler: async (response) => {
            await subscriptionAPI.verifyPayment({ ...response, plan: 'pro', billing });
            updateUser({ subscription: { plan: 'pro', status: 'active' } });
            toast.success('🎉 Welcome to NeuralPath Pro!');
          },
          theme: { color: '#6c63ff' }
        });
        rzp.open();
      } else {
        // Fallback for demo
        toast.success('Payment gateway not configured. Demo mode: Activating Pro... 🎉');
        setTimeout(() => updateUser({ subscription: { plan: 'pro', status: 'active' } }), 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Upgrade to <span className="text-gradient">NeuralPath Pro</span></h1>
        <p className="text-secondary">Unlock the full power of AI-driven learning</p>
      </div>

      {isPro && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mb-6 text-center">
          <div className="text-emerald-400 font-bold text-lg">✨ You're on Pro Plan!</div>
          <p className="text-secondary text-sm mt-1">You have unlimited access to all features.</p>
          {user?.subscription?.endDate && (
            <p className="text-muted text-xs mt-1">Renews: {new Date(user.subscription.endDate).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-surface3 border border-surface rounded-xl p-1">
          <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-accent text-white' : 'text-secondary'}`}>Monthly</button>
          <button onClick={() => setBilling('yearly')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all relative ${billing === 'yearly' ? 'bg-accent text-white' : 'text-secondary'}`}>
            Yearly
            <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">-33%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Free */}
        <div className="card">
          <div className="mb-4">
            <div className="text-base font-bold mb-1">Free</div>
            <div className="text-3xl font-bold">₹0<span className="text-sm text-muted font-normal">/forever</span></div>
          </div>
          <div className="space-y-2 mb-6">
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${f.included ? 'text-secondary' : 'text-muted'}`}>
                <span className={f.included ? 'text-emerald-400' : 'text-slate-700'}>{f.included ? '✓' : '✗'}</span>
                {f.f}
              </div>
            ))}
          </div>
          <button disabled className="btn-outline w-full justify-center opacity-50 cursor-default text-sm">
            {isPro ? 'Previous Plan' : 'Current Plan'}
          </button>
        </div>

        {/* Pro */}
        <div className="card border-accent/40 bg-gradient-to-b from-accent/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
          <div className="mb-4">
            <div className="text-base font-bold mb-1 text-accent">Pro ⭐</div>
            <div className="text-3xl font-bold">
              ₹{billing === 'monthly' ? '499' : '333'}
              <span className="text-sm text-muted font-normal">/{billing === 'monthly' ? 'month' : 'month'}</span>
            </div>
            {billing === 'yearly' && <div className="text-xs text-emerald-400 mt-1">Billed ₹3,999/year · Save ₹1,989</div>}
          </div>
          <div className="space-y-2 mb-6">
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-secondary">
                <span className="text-emerald-400">✓</span>
                {f.f}
              </div>
            ))}
          </div>
          {isPro ? (
            <button className="btn-outline w-full justify-center text-sm" onClick={() => subscriptionAPI.cancel().then(() => toast.success('Subscription cancelled'))}>
              Cancel Subscription
            </button>
          ) : (
            <button onClick={handleSubscribe} disabled={loading} className="btn-primary w-full justify-center text-sm">
              {loading ? <LoadingSpinner size={16} /> : `🚀 Upgrade to Pro — ₹${billing === 'monthly' ? 499 : 3999}/${billing === 'monthly' ? 'mo' : 'yr'}`}
            </button>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <div className="text-base font-semibold mb-4">❓ Frequently Asked Questions</div>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription anytime. You\'ll retain Pro access until the end of your billing period.' },
            { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and wallets via Razorpay.' },
            { q: 'Is there a student discount?', a: 'Yes! Students get 20% off with a valid .edu email. Contact support@neuralpath.in.' },
            { q: 'Can I switch from monthly to yearly?', a: 'Yes, you can switch plans anytime from your account settings. Credits will be prorated.' }
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="text-sm font-medium cursor-pointer flex items-center justify-between">
                {faq.q} <span className="text-muted group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="text-sm text-secondary mt-2 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
