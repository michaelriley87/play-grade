'use client';

interface PostProps {
  post_id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  like_count: number;
}

export default function Post({ post_id, title, body, category, created_at, like_count }: PostProps) {
  console.log('Post Props:', { post_id, title, body, category, created_at, like_count });

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
      <h3>{title}</h3>
      <p>{body}</p>
      <div style={{ fontSize: '0.85rem', color: '#555' }}>
        <span>Category: {category}</span> |{' '}
        <span>Created At: {new Date(created_at).toLocaleString()}</span> |{' '}
        <span>Likes: {like_count}</span>
      </div>
    </div>
  );
}
