'use client';

import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/')}>
      Home
    </Button>
  );
}
