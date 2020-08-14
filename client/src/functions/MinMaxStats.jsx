import * as d3 from "d3";

const MinMaxStats = (row) => {
  const mean = d3.mean(row);
  const sd = d3.deviation(row);
  const upperLimit = mean + 2 * sd;
  const lowerLimit = mean - 2 * sd;
  const max = Math.min(d3.max(row), upperLimit);
  const min = Math.max(lowerLimit, d3.min(row));
  return { max: max, min: min };
};

export default MinMaxStats;
