'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
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
  },
});

export default theme;
