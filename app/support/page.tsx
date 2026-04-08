'use client';

import { useState } from 'react';
import { Header } from '../components/layout';
import {
  MessageCircleIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  CheckIcon,
  AlertCircleIcon,
} from '../components/icons';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.startsWith('260') && cleanPhone.length === 12) return true;
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) return true;
    return false;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (value && !validatePhone(value)) {
      setPhoneError('Valid: 260975xxxxxx or 0975xxxxxx');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid Zambian phone number');
      return;
    }

    setStatus('loading');
    try {
      const message = `[SUPPORT]\nName: ${name}\nPhone: ${phone}\nMessage: ${supportMsg}`;
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: message }),
      });
      if (res.ok) {
        setStatus('success');
        setName('');
        setPhone('');
        setSupportMsg('');
        setPhoneError('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const isFormValid =
    name.trim() &&
    phone.trim() &&
    supportMsg.trim() &&
    !phoneError &&
    validatePhone(phone);

  return (
    <div className="animate-fade-in">
      <Header title="Support" />

      <div className="px-4 pt-4 pb-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-copper/20 to-love/20 blur-xl opacity-50" />
          <div className="relative text-center py-6">
            <h1 className="text-2xl font-bold gradient-text mb-2">
              Support & Contact
            </h1>
            <p className="text-muted text-sm">
              We&apos;re here to help. Reach out anytime.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm text-muted mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="260975xxxxxx or 0975xxxxxx"
              required
              value={phone}
              onChange={handlePhoneChange}
              className={`w-full h-12 px-4 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${
                phoneError ? 'ring-2 ring-love/50' : ''
              }`}
            />
            {phoneError && (
              <p className="text-love text-xs mt-1 flex items-center gap-1">
                <AlertCircleIcon size={12} />
                {phoneError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Message</label>
            <textarea
              rows={4}
              placeholder="Describe your issue or question..."
              required
              value={supportMsg}
              onChange={(e) => setSupportMsg(e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !isFormValid}
            className="w-full h-12 bg-accent text-bg font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon size={18} />
                Send Message
              </>
            )}
          </button>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-success/20 text-success">
              <CheckIcon size={20} />
              <span className="text-sm">
                Message sent! We&apos;ll get back to you soon.
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-love/20 text-love">
              <AlertCircleIcon size={20} />
              <span className="text-sm">
                Something went wrong. Please try again.
              </span>
            </div>
          )}
        </form>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
            Contact Numbers
          </h3>
          <div className="glass rounded-2xl p-5">
            <div className="space-y-3">
              <a
                href="tel:+260750195451"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-copper/20 flex items-center justify-center text-accent">
                  <PhoneIcon size={20} />
                </div>
                <div>
                  <p className="font-semibold">+260 750 195 451</p>
                  <p className="text-xs text-muted">Primary line</p>
                </div>
              </a>

              <a
                href="tel:+260964943277"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper/30 to-love/20 flex items-center justify-center text-copper">
                  <PhoneIcon size={20} />
                </div>
                <div>
                  <p className="font-semibold">+260 964 943 277</p>
                  <p className="text-xs text-muted">Secondary line</p>
                </div>
              </a>

              <a
                href="https://wa.me/260750195451"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/30 to-accent/20 flex items-center justify-center text-success">
                  <MessageCircleIcon size={20} />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-xs text-muted">Quick responses</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
            Other Support
          </h3>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-love/30 to-accent/20 flex items-center justify-center text-love flex-shrink-0">
                <MailIcon size={18} />
              </div>
              <div>
                <p className="font-medium mb-1">Song Removal & Copyright</p>
                <p className="text-sm text-muted">
                  For song removal requests, copyright issues, or urgent
                  matters, please include the song name in your message.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
