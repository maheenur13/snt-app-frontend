import { DeleteOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons';
import { Alert, App, Button, Flex, Form, Input, Modal, Popconfirm, Select, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { api, type User } from '../api';
import { PAGE_SIZE, usePaged } from '../usePaged';

interface Values {
  name: string;
  email: string;
  password?: string;
  role: User['role'];
}

export function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const { data, page, setPage, reload, loading, error } = usePaged<User>('/users');
  const [form] = Form.useForm<Values>();
  // undefined: modal closed, null: adding a user, User: editing that user
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  function openModal(user: User | null) {
    setEditing(user);
    form.setFieldsValue(
      user
        ? { name: user.name, email: user.email, password: '', role: user.role }
        : { name: '', email: '', password: '', role: 'user' },
    );
  }

  async function save(values: Values) {
    setSaving(true);
    try {
      // leave the password untouched unless a new one was typed
      const body = values.password ? values : { ...values, password: undefined };
      if (editing) await api(`/users/${editing._id}`, 'PATCH', body);
      else await api('/users', 'POST', body);
      message.success(editing ? 'User updated' : 'User added');
      setEditing(undefined);
      reload();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(user: User) {
    try {
      await api(`/users/${user._id}`, 'DELETE');
      message.success(`${user.email} deleted`);
      reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  return (
    <Flex vertical gap={24}>
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Users
        </Typography.Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => openModal(null)}>
          Add user
        </Button>
      </Flex>
      {error && <Alert type="error" message={error} showIcon />}

      <Table<User>
        rowKey="_id"
        loading={loading}
        dataSource={data?.items ?? []}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `${total} users`,
        }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          {
            title: 'Role',
            dataIndex: 'role',
            width: 100,
            render: (role: User['role']) => <Tag color={role === 'admin' ? 'purple' : 'blue'}>{role}</Tag>,
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, user) => (
              <Flex gap={4}>
                <Button type="text" icon={<EditOutlined />} onClick={() => openModal(user)} aria-label="Edit user" />
                {user._id !== currentUserId && (
                  <Popconfirm
                    title={`Delete ${user.email}?`}
                    description="Their notes and posts are deleted too."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(user)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete user" />
                  </Popconfirm>
                )}
              </Flex>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? 'Edit user' : 'Add user'}
        open={editing !== undefined}
        onCancel={() => setEditing(undefined)}
        onOk={() => form.submit()}
        okText={editing ? 'Save changes' : 'Add user'}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: 'Enter a name' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? 'New password (optional)' : 'Password'}
            rules={[
              { required: !editing, message: 'Enter a password' },
              { min: 8, message: 'At least 8 characters' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select
              disabled={editing?._id === currentUserId}
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}
