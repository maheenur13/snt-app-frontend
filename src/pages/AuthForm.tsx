import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Form, Input, Segmented, Typography } from 'antd';
import { useState } from 'react';
import { api, type User } from '../api';

type Mode = 'login' | 'register';

interface Values {
  name?: string;
  email: string;
  password: string;
}

export function AuthForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(values: Values) {
    setError('');
    setSubmitting(true);
    try {
      onLogin(await api<User>(`/auth/${mode}`, 'POST', values));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh', background: '#f5f5f5', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          <LockOutlined /> Secure Notes
        </Typography.Title>
        <Segmented
          block
          value={mode}
          onChange={(value) => {
            setMode(value as Mode);
            setError('');
          }}
          options={[
            { label: 'Log in', value: 'login' },
            { label: 'Register', value: 'register' },
          ]}
          style={{ marginBottom: 24 }}
        />
        <Form layout="vertical" onFinish={submit} requiredMark={false}>
          {mode === 'register' && (
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter your name' }]}>
              <Input prefix={<UserOutlined />} autoComplete="name" />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Enter your password' },
              ...(mode === 'register' ? [{ min: 8, message: 'At least 8 characters' }] : []),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Form.Item>
          {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
          <Button type="primary" htmlType="submit" block loading={submitting}>
            {mode === 'login' ? 'Log in' : 'Create account'}
          </Button>
        </Form>
      </Card>
    </Flex>
  );
}
