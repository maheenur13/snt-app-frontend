import { ReadOutlined, SendOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Flex, Form, Input, Select, Tag, Typography } from 'antd';
import { useState } from 'react';
import { api, type User } from '../api';

interface Props {
  user: User;
  onUpdate: (user: User) => void;
  onOpenPosts: (userId: string) => void;
}

interface ProfileValues {
  name: string;
  interests: string[];
}

interface PostValues {
  title: string;
  body: string;
}

export function Profile({ user, onUpdate, onOpenPosts }: Props) {
  const [profileForm] = Form.useForm<ProfileValues>();
  const [postForm] = Form.useForm<PostValues>();
  const [savingProfile, setSavingProfile] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { message } = App.useApp();

  async function saveProfile(values: ProfileValues) {
    setSavingProfile(true);
    try {
      const updated = await api<User>('/users/me', 'PATCH', values);
      onUpdate(updated);
      // the API trims, lower-cases and de-duplicates interests, so show what was saved
      profileForm.setFieldsValue({ interests: updated.interests });
      message.success('Profile saved');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function publish(values: PostValues) {
    setPublishing(true);
    try {
      await api('/posts', 'POST', values);
      postForm.resetFields();
      message.success('Post published');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Flex vertical gap={24}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Profile
      </Typography.Title>

      <Card>
        <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={user.role === 'admin' ? 'purple' : 'blue'}>{user.role}</Tag>
          </Descriptions.Item>
        </Descriptions>
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={{ name: user.name, interests: user.interests }}
          onFinish={saveProfile}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, whitespace: true, message: 'Enter your name' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="interests"
            label="Interests"
            extra="Type an interest and press Enter. Up to 20."
            rules={[{ type: 'array', max: 20, message: 'At most 20 interests' }]}
          >
            <Select mode="tags" placeholder="chess, reading" tokenSeparators={[',']} open={false} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={savingProfile}>
            Save profile
          </Button>
        </Form>
      </Card>

      <Card
        title="Write a post"
        extra={
          <Button icon={<ReadOutlined />} onClick={() => onOpenPosts(user._id)}>
            View my posts
          </Button>
        }
      >
        <Form form={postForm} layout="vertical" onFinish={publish} requiredMark={false}>
          <Form.Item name="title" label="Title" rules={[{ required: true, whitespace: true, message: 'Add a title' }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, whitespace: true, message: 'Write something' }]}
          >
            <Input.TextArea rows={4} maxLength={20000} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={publishing} icon={<SendOutlined />}>
            Publish
          </Button>
        </Form>
      </Card>
    </Flex>
  );
}
