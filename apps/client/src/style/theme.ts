'use client';

import { createTheme } from '@mui/material/styles';
import { COMMON_DIALOG_Z_INDEX } from './constant';

export const theme = createTheme({
  cssVariables: true,
  transitions: {
    // 禁用所有过渡动画，避免产生 detached nodes
    create: () => 'none',
  },
  components: {
    MuiButton: {
      defaultProps: {
        sx: {
          textTransform: 'none',
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          body2: 'span',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          padding: '0 16px',
          '@media (pointer: coarse)': {
            // 强制覆盖原有样式
            padding: '0 16px !important',
          },
        },
      },
    },
  },
  zIndex: {
    modal: COMMON_DIALOG_Z_INDEX,
  },
  palette: {
    info: {
      // main: '#bae0ff',
      // light: '#e6f4ff',
      // dark: '#91caff',
      main: '#69b1ff',
      light: '#91caff',
      dark: '#4096ff',
    },
    secondary: {
      main: '#8c8c8c',
      light: '#bfbfbf',
      dark: '#595959',
    },
  },
});

export default theme;
