import { useState, type FormEvent } from 'react';
import { api, setToken, type User } from '../api';

export function AuthForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const result = await api<{ token: string; user: User }>(`/auth/${mode}`, 'POST', body);
      setToken(result.token);
      onLogin(result.user);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>{mode === 'login' ? 'Log in' : 'Register'}</h1>
      {mode === 'register' && (
        <p>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        </p>
      )}
      <p>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </p>
      <p>
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === 'register' ? 8 : undefined}
          required
        />
      </p>
      {error && <p className="error">{error}</p>}
      <button type="submit">{mode === 'login' ? 'Log in' : 'Create account'}</button>{' '}
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Log in'}
      </button>
    </form>
  );
}
