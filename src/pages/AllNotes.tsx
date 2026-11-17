import { Alert, Flex, Table, Typography } from 'antd';
import type { Note } from '../api';
import { PAGE_SIZE, usePaged } from '../usePaged';

export function AllNotes() {
  const { data, page, setPage, loading, error } = usePaged<Note>('/notes/all');

  return (
    <Flex vertical gap={24}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        All notes
      </Typography.Title>
      {error && <Alert type="error" message={error} showIcon />}
      <Table<Note>
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
          showTotal: (total) => `${total} notes`,
        }}
        columns={[
          { title: 'Title', dataIndex: 'title', width: 300 },
          { title: 'Content', dataIndex: 'content', ellipsis: true },
          {
            title: 'Owner',
            dataIndex: 'owner',
            width: 220,
            render: (owner: Note['owner']) =>
              typeof owner === 'object' && owner ? (
                <>
                  {owner.name}
                  <br />
                  <Typography.Text type="secondary">{owner.email}</Typography.Text>
                </>
              ) : (
                <Typography.Text type="secondary">Deleted user</Typography.Text>
              ),
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            width: 180,
            render: (value: string) => new Date(value).toLocaleString(),
          },
        ]}
      />
    </Flex>
  );
}
