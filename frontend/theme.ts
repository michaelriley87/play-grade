"use client";

import { MantineTheme, MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  components: {
    Chip: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundImage: 'linear-gradient(135deg, #6a11cb, #2575fc)',
          color: theme.white,
          border: 'none',
          padding: '8px 8px',
          fontWeight: 'bold',
          borderRadius: '20px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&[dataChecked]': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 10px rgba(101, 77, 189, 0.4)',
          },
          '&:hover': {
            boxShadow: '0 4px 10px rgba(101, 77, 189, 0.3)',
          },
        },
      }),
    },
  },
};