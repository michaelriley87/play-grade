'use client';

import { Text, Group } from '@mantine/core';

export default function Header() {
  return (
    <Group
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: '80px'
      }}
    >
      <Text size="xl" fw={700}>
        Play Grade
      </Text>
    </Group>
  );
}
