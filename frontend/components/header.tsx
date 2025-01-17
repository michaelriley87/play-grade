import Image from 'next/image';

const Header = () => (
  <header style={{ textAlign: 'center' }}>
    <Image 
      src="/title-logo.png" 
      alt="Title Logo" 
      width={550}
      height={60}
      style={{ margin: '20px 0', width: '100%', height: 'auto' }}
    />
  </header>
);

export default Header;
