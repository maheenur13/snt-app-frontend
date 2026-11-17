import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Empty, Flex, Form, Input, List, Pagination, Popconfirm, Typography } from 'antd';
import { useState } from 'react';
import { api, type Note } from '../api';
import { PAGE_SIZE, usePaged } from '../usePaged';

interface Values {
  title: string;
  content?: string;
}

export function Notes() {
  const { data, page, setPage, reload, loading, error } = usePaged<Note>('/notes');
  const [form] = Form.useForm<Values>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  function resetForm() {
    form.resetFields();
    setEditingId(null);
  }

  async function save(values: Values) {
    setSaving(true);
    try {
      const body = { title: values.title, content: values.content ?? '' };
      if (editingId) await api(`/notes/${editingId}`, 'PATCH', body);
      else await api('/notes', 'POST', body);
      message.success(editingId ? 'Note updated' : 'Note added');
      resetForm();
      reload();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(note: Note) {
    try {
      await api(`/notes/${note._id}`, 'DELETE');
      message.success('Note deleted');
      if (note._id === editingId) resetForm();
      reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note._id);
    form.setFieldsValue({ title: note.title, content: note.content });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <Flex vertical gap={24}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        My notes
      </Typography.Title>

      <Card title={editingId ? 'Edit note' : 'New note'}>
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
          <Form.Item name="title" label="Title" rules={[{ required: true, whitespace: true, message: 'Add a title' }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <Input.TextArea rows={4} maxLength={20000} />
          </Form.Item>
          <Flex gap={8}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={editingId ? <EditOutlined /> : <PlusOutlined />}
            >
              {editingId ? 'Save changes' : 'Add note'}
            </Button>
            {editingId && <Button onClick={resetForm}>Cancel</Button>}
          </Flex>
        </Form>
      </Card>

      {error && <Alert type="error" message={error} showIcon />}

      <List
        loading={loading}
        dataSource={data?.items ?? []}
        locale={{ emptyText: <Empty description="No notes yet" /> }}
        renderItem={(note) => (
          <Card
            key={note._id}
            title={note.title}
            style={{ marginBottom: 16 }}
            extra={
              <Flex gap={4}>
                <Button type="text" icon={<EditOutlined />} onClick={() => startEdit(note)} aria-label="Edit note" />
                <Popconfirm
                  title="Delete this note?"
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove(note)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete note" />
                </Popconfirm>
              </Flex>
            }
          >
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {note.content || <Typography.Text type="secondary">No content</Typography.Text>}
            </Typography.Paragraph>
            <Typography.Text type="secondary">Updated {new Date(note.updatedAt).toLocaleString()}</Typography.Text>
          </Card>
        )}
      />

      <Pagination
        align="center"
        current={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onChange={setPage}
        hideOnSinglePage
        showSizeChanger={false}
      />
    </Flex>
  );
}
