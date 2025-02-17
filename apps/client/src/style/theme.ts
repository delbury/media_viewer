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
  },
});

export default theme;
