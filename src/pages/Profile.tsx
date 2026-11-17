import { useState, type FormEvent } from 'react';
import { api, type User } from '../api';

interface Props {
  user: User;
  onUpdate: (user: User) => void;
  onOpenPosts: (userId: string) => void;
}

export function Profile({ user, onUpdate, onOpenPosts }: Props) {
  const [name, setName] = useState(user.name);
  const [interests, setInterests] = useState(user.interests.join(', '));
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function run(action: () => Promise<void>, success: string) {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(success);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      const updated = await api<User>('/users/me', 'PATCH', {
        name,
        interests: interests.split(','),
      });
      onUpdate(updated);
      setInterests(updated.interests.join(', '));
    }, 'Profile saved.');
  }

  function createPost(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      await api('/posts', 'POST', { title: postTitle, body: postBody });
      setPostTitle('');
      setPostBody('');
    }, 'Post published.');
  }

  return (
    <section>
      <h2>Profile</h2>
      <p>{user.email}</p>
      <form onSubmit={saveProfile} className="card">
        <p>
          <label>
            Name <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        </p>
        <p>
          <label>
            Interests (comma separated){' '}
            <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="chess, reading" />
          </label>
        </p>
        <button type="submit">Save profile</button>
      </form>

      <h2>Write a post</h2>
      <form onSubmit={createPost} className="card">
        <input placeholder="Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required />
        <textarea placeholder="Body" rows={4} value={postBody} onChange={(e) => setPostBody(e.target.value)} required />
        <button type="submit">Publish</button>{' '}
        <button type="button" onClick={() => onOpenPosts(user._id)}>
          View my posts
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
