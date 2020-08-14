const MinMaxNormalize = (val, min, max) => {
  return (val - min) / (max - min);
};

export default MinMaxNormalize;
