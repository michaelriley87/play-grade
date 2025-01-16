"use client";

import { MantineTheme, MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  components: {
    Chip: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundImage: "linear-gradient(135deg, #6a11cb, #2575fc)",
          color: theme.white,
          padding: "8px 8px",
          fontWeight: "bold",
          transition: "transform 0.2s, box-shadow 0.2s",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50px",
          minWidth: "100px",
        },
      }),
    },
    Card: {
      styles: (theme: MantineTheme) => ({
        root: {
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          padding: theme.spacing.md,
          boxShadow: theme.shadows.sm,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.gray[0],
        },
      }),
    },
  },
};
