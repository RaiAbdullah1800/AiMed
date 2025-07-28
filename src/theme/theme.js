import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#616161',
      light: '#9E9E9E',
      dark: '#424242',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#1976D2',
    },
    success: {
      main: '#388E3C',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    action: {
      active: '#1976D2',
      hover: 'rgba(25, 118, 210, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(25, 118, 210, 0.16)',
      selectedOpacity: 0.16,
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      focus: 'rgba(25, 118, 210, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','), // Using Inter as per design
    h1: {
      fontSize: '3rem', // "I'm Rayan Adlirdard"
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '4rem',
      },
    },
    h2: {
      fontSize: '2rem', // "Front-end Developer"
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1976D2', // Primary color for this heading
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h3: {
      fontSize: '1.75rem', // "My Services"
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontSize: '1.5rem', // Section titles like "Web Development"
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '1.25rem', // Smaller section titles or card headings
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem', // Card subheadings or smaller titles
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem', // Main body text
      lineHeight: 1.6,
      color: '#767676', // Secondary text color
    },
    body2: {
      fontSize: '0.875rem', // Smaller body text, descriptions
      lineHeight: 1.5,
      color: '#767676',
    },
    button: {
      fontSize: '1rem', // Button text
      fontWeight: 600,
      textTransform: 'none', // Keep button text as is, no uppercase
    },
    caption: {
      fontSize: '0.75rem', // Smallest text, e.g., copyright, labels
      color: '#B0B0B0',
    },
    overline: {
      fontSize: '0.75rem', // Uppercase text, e.g., categories
      textTransform: 'uppercase',
    },
  },
  spacing: 8, // Default spacing unit (e.g., theme.spacing(1) = 8px)
  shape: {
    borderRadius: 8, // Global border radius for most components
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for buttons
          padding: '10px 20px',
          boxShadow: 'none', // Remove default Material UI shadow
          '&:hover': {
            boxShadow: 'none', // No shadow on hover
          },
        },
        containedPrimary: {
          backgroundColor: '#1976D2',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.5)', // Darker primary on hover
          },
          '&:active': {
            backgroundColor: 'rgba(25, 118, 210, 0.5)', // Even darker on active
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(25, 118, 210, 0.5)', // Faded primary when disabled
            color: 'rgba(43, 43, 43, 0.7)',
          },
        },
        outlinedPrimary: {
          borderColor: '#FFB400',
          color: '#FFB400',
          '&:hover': {
            backgroundColor: 'rgba(255, 180, 0, 0.08)',
            borderColor: '#CC9100',
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(255, 180, 0, 0.3)',
            color: 'rgba(255, 180, 0, 0.5)',
          },
        },
        textPrimary: {
          color: '#1976D2',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
          '&.Mui-disabled': {
            color: 'rgba(25, 118, 210, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // More rounded corners for cards
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Subtle shadow
          backgroundColor: '#FFFFFF',
          padding: '24px', // Internal padding for card content
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Default paper elements
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.03)', // Lighter shadow for elevation 1
        },
        elevation8: { // For menus, popovers
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // No shadow for app bar if it's meant to be flat
          backgroundColor: '#FFFFFF', // White background
          color: '#2B2B2B', // Dark text color
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#1976D2', // Primary color for links
          textDecoration: 'none', // No underline by default
          '&:hover': {
            textDecoration: 'underline', // Underline on hover
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#767676', // Default icon color
          '&:hover': {
            color: '#1976D2', // Primary color on hover
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
          '&.Mui-disabled': {
            color: '#B0B0B0', // Disabled icon color
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(25, 118, 210, 0.1)', // Light background for chips
          color: '#2B2B2B',
          fontWeight: 500,
          borderRadius: 4, // Slightly less rounded for chips
        },
        deletable: {
          '&:focus': {
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8, // Height for skill bars
          borderRadius: 4,
          backgroundColor: '#E0E0E0', // Background of the progress bar
        },
        bar: {
          backgroundColor: '#1976D2', // Color of the progress
          borderRadius: 4,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 80, // Example size for the profile picture
          height: 80,
          border: '4px solid #1976D2', // Border around the avatar
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#E0E0E0', // Light grey divider
          margin: '16px 0', // Default margin for dividers
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2B2B2B', // Dark background for tooltips
          color: '#FFFFFF',
          fontSize: '0.875rem',
          borderRadius: 4,
        },
        arrow: {
          color: '#2B2B2B',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#E0E0E0', // Default border color
            },
            '&:hover fieldset': {
              borderColor: '#1976D2', // Primary color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976D2', // Primary color on focus
              borderWidth: '2px', // Thicker border on focus
            },
            '&.Mui-error fieldset': {
              borderColor: '#FF4D4D', // Error color
            },
          },
          '& .MuiInputLabel-root': {
            color: '#767676', // Label color
            '&.Mui-focused': {
              color: '#1976D2', // Label color on focus
            },
            '&.Mui-error': {
              color: '#FF4D4D', // Label color on error
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)', // Selected list item background
            color: '#212121',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.15)',
            },
          },
        },
      },
    },
  },
});

// Make font sizes responsive
theme = responsiveFontSizes(theme);

export default theme;

