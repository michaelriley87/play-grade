'use client';

import styles from '@/styles/components.module.css';
import { Stack } from '@mantine/core';
import Reply from '@/components/reply';
import { ReplyFeedProps } from '@/types/interfaces';

export default function ReplyFeed({ replies }: ReplyFeedProps) {
  if (!replies.length) {
    return null;
  }

  return (
    <Stack align='start' style={{ width: '100%' }}>
      {replies.map(reply => (
        <Reply key={reply.reply_id} {...reply} />
      ))}
    </Stack>
  );
}
