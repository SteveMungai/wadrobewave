import React, { useState } from 'react';
import { api } from '../api';

export function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result =
        mode === 'signup'
          ? await api.signup(form)
          : await api.login({ email: form.email, password: form.password });
      onAuthed(result.token, result.user);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <h2>{mode === 'login' ? 'Log in' : 'Create an account'}</h2>
      <form onSubmit={submit}>
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="form-error">{error}</p>}
        <button className="btn-gold" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <p className="auth-switch">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMode('signup');
              }}
            >
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMode('login');
              }}
            >
              Log in
            </a>
          </>
        )}
      </p>
    </div>
  );
}
