import { quantile } from "d3-array";

const QuartileStats = (data) => {
  const q1 = quantile(data, 0.25);
  const median = quantile(data, 0.5);
  const q3 = quantile(data, 0.75);
  const IQR = q3 - q1;

  return {
    min: q1 - 1.5 * IQR,
    q1: q1,
    median: median,
    q3: q3,
    max: q3 + 1.5 * IQR,
  };
};

export default QuartileStats;
