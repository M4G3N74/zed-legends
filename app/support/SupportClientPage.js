'use client';

import { useState } from 'react';

export default function SupportClientPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [status, setStatus] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  // Validate phone number format
  const validatePhone = (phoneNumber) => {
    // Remove any spaces or special characters
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    // Check if it starts with 260 (international) or 0 (local)
    if (cleanPhone.startsWith('260') && cleanPhone.length === 12) {
      return true;
    }
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      return true;
    }
    return false;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    
    if (value && !validatePhone(value)) {
      setPhoneError('Please enter a valid Zambian phone number (e.g., 260975xxxxxx or 0975xxxxxx)');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
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

  const isFormValid = name.trim() && phone.trim() && supportMsg.trim() && !phoneError;

  return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4 py-12">
        <div className="bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg p-8 max-w-lg w-full text-center border border-overlay/30">
          <h1 className="text-2xl font-bold mb-4 text-mauve">Support & Contact</h1>
          <p className="text-muted mb-6">
            Need help or want to get in touch? Use the contact info below or send a message here.
          </p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              className="bg-background/70 border border-overlay rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-mauve"
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div>
              <input
                className={`bg-background/70 border rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-mauve w-full ${
                  phoneError ? 'border-red-500' : 'border-overlay'
                }`}
                type="tel"
                placeholder="Phone (260975xxxxxx or 0975xxxxxx)"
                required
                value={phone}
                onChange={handlePhoneChange}
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-1 text-left">{phoneError}</p>
              )}
            </div>
            <textarea
              className="bg-background/70 border border-overlay rounded-md p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-mauve"
              rows={4}
              placeholder="Describe your issue or question..."
              required
              value={supportMsg}
              onChange={e => setSupportMsg(e.target.value)}
            />
            <button
              type="submit"
              className="bg-mauve text-background font-semibold py-2 rounded-lg hover:bg-mauve/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status === 'loading' || !isFormValid}
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          {status === 'success' && <p className="text-green-600 mt-2">Message sent! Thank you.</p>}
          {status === 'error' && <p className="text-red-600 mt-2">Something went wrong. Please try again.</p>}
          <div className="mb-4 mt-6">
            <h2 className="text-lg font-semibold mb-2">Contact Numbers</h2>
            <p className="font-bold text-mauve mb-2">+260 750 195 451</p>
            <p className="font-bold text-mauve mb-2">+260 964 943 277</p>
            <p className="text-muted">Available on WhatsApp and Telegram</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Other Support</h2>
            <p className="text-muted">For song removal, copyright, or urgent issues, please mention the song name and your request.</p>
          </div>
        </div>
      </div>
  );
} 