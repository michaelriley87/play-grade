'use client';

const API_URL = 'http://127.0.0.1:5000';

interface PostProps {
  post_id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  like_count: number;
  image_url?: string;
}

export default function Post({
  post_id,
  title,
  body,
  category,
  created_at,
  like_count,
  image_url,
}: PostProps) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
      }}
    >
      <h3>{title}</h3>
      <p>{body}</p>
      {image_url && (
        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <img
            src={API_URL + image_url}
            alt={title}
            style={{ maxWidth: '100%', borderRadius: '5px' }}
          />
        </div>
      )}
      <div style={{ fontSize: '0.85rem', color: '#555' }}>
        <span>Category: {category}</span> |{' '}
        <span>Created At: {new Date(created_at).toLocaleString()}</span> |{' '}
        <span>Likes: {like_count}</span>
      </div>
    </div>
  );
}
