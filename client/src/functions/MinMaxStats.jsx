const getMean = (array) => {
  return array.reduce((a, b) => a + b) / array.length;
};

const getMin = (array) => {
  let min = Number.POSITIVE_INFINITY;
  array.forEach((e) => {
    if (e < min) {
      min = e;
    }
  });
  return min;
};

const getMax = (array) => {
  let max = Number.NEGATIVE_INFINITY;
  array.forEach((e) => {
    if (e > max) {
      max = e;
    }
  });
  return max;
};

const getSD = (array) => {
  const n = array.length;
  const mean = getMean(array);
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
};

const MinMaxStats = (row) => {
  const mean = getMean(row);
  const sd = getSD(row);
  const upperLimit = mean + 2 * sd;
  const lowerLimit = mean - 2 * sd;
  const max = Math.min(getMax(row), upperLimit);
  const min = Math.max(lowerLimit, getMin(row));
  return { max: max, min: min };
};

export default MinMaxStats;
