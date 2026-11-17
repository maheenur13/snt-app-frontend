import { Alert, Card, Empty, Flex, List, Pagination, Typography } from 'antd';
import type { Page, Post } from '../api';
import { PAGE_SIZE, usePaged } from '../usePaged';

export function UserPosts({ userId }: { userId: string }) {
  const { data, page, setPage, loading, error } = usePaged<Post>(`/users/${userId}/posts`);
  const author = (data as (Page<Post> & { user: { name: string } }) | null)?.user;

  return (
    <Flex vertical gap={24}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Posts{author && ` by ${author.name}`}
      </Typography.Title>
      {error && <Alert type="error" message={error} showIcon />}

      <List
        loading={loading}
        dataSource={data?.items ?? []}
        locale={{ emptyText: <Empty description="No posts yet" /> }}
        renderItem={(post) => (
          <Card key={post._id} title={post.title} style={{ marginBottom: 16 }}>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{post.body}</Typography.Paragraph>
            <Typography.Text type="secondary">{new Date(post.createdAt).toLocaleString()}</Typography.Text>
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
