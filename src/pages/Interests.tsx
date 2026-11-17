import { Alert, Badge, Button, Card, Empty, Flex, List, Pagination, theme, Typography } from 'antd';
import { PAGE_SIZE, usePaged } from '../usePaged';

interface InterestGroup {
  interest: string;
  count: number;
  users: { _id: string; name: string }[];
}

export function Interests({ onOpenPosts }: { onOpenPosts: (userId: string) => void }) {
  const { data, page, setPage, loading, error } = usePaged<InterestGroup>('/users/by-interest');
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={24}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Users by interest
        </Typography.Title>
        <Typography.Text type="secondary">Click a name to see that user's posts.</Typography.Text>
      </div>
      {error && <Alert type="error" message={error} showIcon />}

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={data?.items ?? []}
        locale={{ emptyText: <Empty description="Nobody has added interests yet" /> }}
        renderItem={(group) => (
          <List.Item>
            <Card
              size="small"
              title={group.interest}
              extra={<Badge count={group.count} color={token.colorPrimary} overflowCount={9999} />}
            >
              <Flex wrap gap={4}>
                {group.users.map((u) => (
                  <Button key={u._id} size="small" onClick={() => onOpenPosts(u._id)}>
                    {u.name}
                  </Button>
                ))}
                {group.count > group.users.length && (
                  <Typography.Text type="secondary">+{group.count - group.users.length} more</Typography.Text>
                )}
              </Flex>
            </Card>
          </List.Item>
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
