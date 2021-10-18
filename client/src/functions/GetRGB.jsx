/* Code adapted from http://www.andrewnoske.com/wiki/Code_-_heatmaps_and_color_gradients */

const GetRGB = (val) => {
  if (val == null) {
    return "transparent";
  }
  const colors = [
    [0, 0, 255],
    [255, 255, 255],
    [255, 0, 0],
  ];

  let value = val;
  let index1 = 0;
  let index2 = 0;
  let fract = 0;
  if (value <= 0) {
    index1 = 0;
    index2 = 0;
  } else if (value >= 1) {
    index1 = colors.length - 1;
    index2 = colors.length - 1;
  } else {
    value = value * (colors.length - 1);
    index1 = Math.floor(value);
    index2 = index1 + 1;
    fract = value - index1;
  }

  const r = (colors[index2][0] - colors[index1][0]) * fract + colors[index1][0];
  const g = (colors[index2][1] - colors[index1][1]) * fract + colors[index1][1];
  const b = (colors[index2][2] - colors[index1][2]) * fract + colors[index1][2];

  return `rgb(${r},${g},${b})`;
};

export default GetRGB;
