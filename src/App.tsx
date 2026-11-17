import { useEffect, useState } from 'react';
import { api, SESSION_EXPIRED, type User } from './api';
import { AdminUsers } from './pages/AdminUsers';
import { AllNotes } from './pages/AllNotes';
import { AuthForm } from './pages/AuthForm';
import { Interests } from './pages/Interests';
import { Notes } from './pages/Notes';
import { Profile } from './pages/Profile';
import { UserPosts } from './pages/UserPosts';

type View = 'notes' | 'profile' | 'interests' | 'users' | 'all-notes' | 'posts';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('notes');
  const [postsUserId, setPostsUserId] = useState('');

  useEffect(() => {
    // the cookie can't be read from JS, so ask the API whether we're signed in
    api<User>('/users/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, []);

  async function logout() {
    await api('/auth/logout', 'POST').catch(() => undefined);
    setUser(null);
    setView('notes');
  }

  function openPosts(userId: string) {
    setPostsUserId(userId);
    setView('posts');
  }

  if (loading) return <p>Loading...</p>;
  if (!user) return <AuthForm onLogin={setUser} />;

  const tabs: [View, string][] = [
    ['notes', 'My notes'],
    ['profile', 'Profile & posts'],
    ['interests', 'Users by interest'],
  ];
  if (user.role === 'admin') tabs.push(['users', 'Manage users'], ['all-notes', 'All notes']);

  return (
    <>
      <header>
        <p>
          Signed in as <strong>{user.name}</strong> ({user.role}) <button onClick={logout}>Log out</button>
        </p>
        <nav>
          {tabs.map(([key, label]) => (
            <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {view === 'notes' && <Notes />}
        {view === 'profile' && <Profile user={user} onUpdate={setUser} onOpenPosts={openPosts} />}
        {view === 'interests' && <Interests onOpenPosts={openPosts} />}
        {view === 'users' && <AdminUsers currentUserId={user._id} />}
        {view === 'all-notes' && <AllNotes />}
        {view === 'posts' && <UserPosts userId={postsUserId} />}
      </main>
    </>
  );
}
