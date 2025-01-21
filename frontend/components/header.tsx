import Image from 'next/image';
import Link from 'next/link';

const Header = () => (
  <header style={{ textAlign: 'center' }}>
    <Link href="/">
      <Image
        src="/title-logo.png"
        alt="Title Logo"
        width={550}
        height={60}
        style={{ margin: '20px 0', width: '100%', height: 'auto' }}
      />
    </Link>
  </header>
);

export default Header;
