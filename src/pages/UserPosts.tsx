import type { Page, Post } from '../api';
import { Pager, usePaged } from '../paging';

export function UserPosts({ userId }: { userId: string }) {
  const { data, page, setPage, error } = usePaged<Post>(`/users/${userId}/posts`);
  const author = (data as (Page<Post> & { user: { name: string } }) | null)?.user;

  return (
    <section>
      <h2>Posts{author && ` by ${author.name}`}</h2>
      {error && <p className="error">{error}</p>}
      {data?.items.length === 0 && <p>No posts yet.</p>}
      {data?.items.map((post) => (
        <article key={post._id} className="card">
          <h3>{post.title}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{post.body}</p>
          <small>{new Date(post.createdAt).toLocaleString()}</small>
        </article>
      ))}
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
