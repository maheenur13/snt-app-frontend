import { Pager, usePaged } from '../paging';

interface InterestGroup {
  interest: string;
  count: number;
  users: { _id: string; name: string }[];
}

export function Interests({ onOpenPosts }: { onOpenPosts: (userId: string) => void }) {
  const { data, page, setPage, error } = usePaged<InterestGroup>('/users/by-interest');

  return (
    <section>
      <h2>Users by interest</h2>
      <p>Click a name to see that user's posts.</p>
      {error && <p className="error">{error}</p>}
      {data?.items.length === 0 && <p>Nobody has added interests yet.</p>}
      {data?.items.map((group) => (
        <div key={group.interest} className="card">
          <strong>{group.interest}</strong> ({group.count})
          <ul>
            {group.users.map((u) => (
              <li key={u._id}>
                <button onClick={() => onOpenPosts(u._id)}>{u.name}</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
