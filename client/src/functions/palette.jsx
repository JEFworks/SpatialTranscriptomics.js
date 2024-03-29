import { randomColor } from "randomcolor";

const palette = [
  `#EF70A4`,
  `#BDC7E6`,
  `#008E73`,
  `#FFECB8`,
  `#CE5251`,
  `#F4A4C6`,
  `#ADB9C8`,
  `#7193CA`,
  `#FFE005`,
  `#F7A99E`,
  `#E4C7D1`,
  `#829FC2`,
  `#ACBAAB`,
  `#FFCE40`,
  `#FEE4CC`,
  `#C899C4`,
  `#31514A`,
  `#AFAC8A`,
  `#FED497`,
  `#D5A57B`,
  `#8584BE`,
  `#245C94`,
  `#A9CF70`,
  `#F79C5A`,
  `#A17869`,
  `#AF9DCA`,
  `#008E9F`,
  `#E0E9B0`,
  `#D37049`,
  `#ADA9A5`,
];

const getPalette = (numColors) => {
  if (numColors <= palette.length) {
    return palette.slice(0, numColors);
  }

  const extraColors = [];
  for (let i = palette.length; i < numColors; i++) {
    extraColors.push(randomColor({ seed: i }));
  }
  return palette.concat(extraColors);
};

export default getPalette;
