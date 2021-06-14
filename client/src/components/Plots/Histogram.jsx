import { ResponsiveBar } from "@nivo/bar";

const red = "#ff80ab";
const blue = "#80d8ff";
const getColor = (bar) => bar.data.color;

const setColor = (val, min) => {
  return val < min ? red : blue;
};

const getMarkerLine = (data, min) => {
  const length = data.length;
  for (let i = 0; i < length; i++) {
    if (data[i].range >= min) {
      return data[i].range;
    }
  }
  return min.toFixed(1);
};

const markers = (markerLine) => [
  {
    axis: "x",
    value: markerLine,
    lineStyle: {
      stroke: red,
      strokeWidth: 1,
    },
  },
];

const xAxis = (label) => ({
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 90,
  legend: label,
  legendPosition: "middle",
  legendOffset: 40,
});

const yAxis = {
  tickSize: 1,
  tickPadding: 5,
  legend: "frequency",
  legendPosition: "middle",
  legendOffset: -40,
};

const Histogram = (props) => {
  const { min } = props;

  const data = !props.data
    ? [{ range: 0, frequency: 0, color: "black" }]
    : props.data.map((datum) => {
        return {
          range: datum.range.toFixed(1),
          frequency: datum.frequency,
          color: setColor(datum.range, min),
        };
      });

  return (
    <ResponsiveBar
      theme={{ textColor: "black" }}
      data={data}
      keys={["frequency"]}
      indexBy="range"
      margin={{ top: 5, right: 0, bottom: 50, left: 45 }}
      colors={getColor}
      markers={data.length < 1 ? null : markers(getMarkerLine(data, min))}
      axisBottom={xAxis(props.xLabel)}
      axisLeft={yAxis}
      enableLabel={false}
      enableGridX={false}
      enableGridY={false}
      isInteractive={false}
    />
  );
};

export default Histogram;
