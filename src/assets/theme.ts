import { createTheme } from "@mantine/core";

export const theme = createTheme({
    fontFamily: 'Montserrat, sans-serif',
    defaultRadius: 'md',
    headings: {
      fontWeight: '400',
      fontFamily: 'monospace'
    },
    breakpoints: {
      xs: '22.5em',   // 360px - Samsung Galaxy S8
      sm: '48em',     // 768px - iPad Portrait
      md: '64em',     // 1024px - iPad Landscape
      lg: '85em',     // 1360px - Laptop
      xl: '120em'     // 1920px - 1080P
    }
  });