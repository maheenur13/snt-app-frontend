import {
  FileTextOutlined,
  LockOutlined,
  LogoutOutlined,
  ReadOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Flex, Layout, Menu, Spin, Tag, Typography } from 'antd';
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

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }
  if (!user) return <AuthForm onLogin={setUser} />;

  const menuItems = [
    { key: 'notes', icon: <FileTextOutlined />, label: 'My notes' },
    { key: 'profile', icon: <UserOutlined />, label: 'Profile & posts' },
    { key: 'interests', icon: <TagsOutlined />, label: 'Interests' },
    ...(user.role === 'admin'
      ? [
          { key: 'users', icon: <TeamOutlined />, label: 'Users' },
          { key: 'all-notes', icon: <ReadOutlined />, label: 'All notes' },
        ]
      : []),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, whiteSpace: 'nowrap' }}>
          <LockOutlined /> Secure Notes
        </Typography.Title>
        <Menu
          mode="horizontal"
          selectedKeys={[view]}
          items={menuItems}
          onClick={({ key }) => setView(key as View)}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none' }}
        />
        <Flex align="center" gap={8}>
          <Avatar icon={<UserOutlined />} />
          <Typography.Text strong>{user.name}</Typography.Text>
          {user.role === 'admin' && <Tag color="purple">admin</Tag>}
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Log out
          </Button>
        </Flex>
      </Layout.Header>
      <Layout.Content style={{ padding: 24, width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        {view === 'notes' && <Notes />}
        {view === 'profile' && <Profile user={user} onUpdate={setUser} onOpenPosts={openPosts} />}
        {view === 'interests' && <Interests onOpenPosts={openPosts} />}
        {view === 'users' && <AdminUsers currentUserId={user._id} onOpenPosts={openPosts} />}
        {view === 'all-notes' && <AllNotes />}
        {view === 'posts' && <UserPosts userId={postsUserId} />}
      </Layout.Content>
    </Layout>
  );
}
