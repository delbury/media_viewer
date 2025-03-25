const screenWidth = {
  mobileM: '375px',
  tablet: '768px',
  laptop: '992px',
  laptopL: '1248px',
  desktopS: '1440px',
  desktop: '1920px',
};

export const screenMax = {
  mobileM: `screen and (max-width: ${screenWidth.mobileM})`,
  tablet: `screen and (max-width: ${screenWidth.tablet})`,
  laptop: `screen and (max-width: ${screenWidth.laptop})`,
  laptopL: `screen and (max-width: ${screenWidth.laptopL})`,
  desktopS: `screen and (max-width: ${screenWidth.desktopS})`,
  desktop: `screen and (max-width: ${screenWidth.desktop})`,
};

export const h5Max = screenMax.tablet;
