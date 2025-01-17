import Header from '@/components/header';
import Filters from '@/components/filters';
import CreatePost from '@/components/create-post';
import Feed from '@/components/feed';

export default function HomePage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div style={{ width: '550px', margin: '0 auto' }}>
        <Header />
        <Filters />
      </div>
    </div>
  );
}
