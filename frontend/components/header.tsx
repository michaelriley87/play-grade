import { Image } from '@mantine/core';
import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ textAlign: 'center' }}>
      <Link href='/'>
        <Image src='/title-logo.png' style={{ margin: '20px 0', width: '100%' }} />
      </Link>
    </header>
  );
}
