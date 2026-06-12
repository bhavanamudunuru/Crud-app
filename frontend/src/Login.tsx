import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗂️</div>

        {/* Title */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '8px' }}>
          CRUD App
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '40px' }}>
          Sign in to manage your data
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: '#450a0a',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#ffffff',
            color: '#333333',
            border: '1px solid #dddddd',
            borderRadius: '8px',
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {/* Google Icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.9 13.3l7.8 6.1C12.5 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
            <path fill="#FBBC05" d="M10.7 28.6C10.3 27.4 10 26.2 10 24s.3-3.4.7-4.6L2.9 13.3C1.1 16.8 0 20.3 0 24s1.1 7.2 2.9 10.7l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.2 0-11.5-3.5-13.3-8.9l-7.8 6.1C6.7 42.6 14.7 48 24 48z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

      </div>
    </div>
  );
}
