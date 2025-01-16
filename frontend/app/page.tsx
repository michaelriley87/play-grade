import Header from '@/components/header';
import Filters from '@/components/filters';
import CreatePost from '@/components/create-post';
import Feed from '@/components/feed';

export default function HomePage() {
  return (
    <div>
      <div style={{ width: '550px', margin: '0 auto' }}>
        <Header />
        <CreatePost />
      </div>
    </div>
  );
}
