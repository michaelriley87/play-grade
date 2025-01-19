'use client';

interface PostProps {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  likes: number;
}

export default function Post({ id, title, content, category, createdAt, likes }: PostProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
      <h3>{title}</h3>
      <p>{content}</p>
      <div style={{ fontSize: '0.85rem', color: '#555' }}>
        <span>Category: {category}</span> |{' '}
        <span>Created At: {new Date(createdAt).toLocaleString()}</span> |{' '}
        <span>Likes: {likes}</span>
      </div>
    </div>
  );
}
