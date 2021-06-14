import { ResponsiveLine } from "@nivo/line";

const red = "#ff80ab";

const markers = (redLineLabel, redLine, max) => [
  {
    axis: "x",
    value: redLine >= max ? max : redLine,
    legend: redLineLabel,
    lineStyle: {
      stroke: red,
      strokeWidth: 1,
    },
    textStyle: {
      fill: red,
    },
  },
];

const LineChart = (props) => {
  const {
    data,
    redLine,
    redLineLabel,
    max,
    xLabel,
    yLabel,
    tickValues,
    type,
  } = props;

  return (
    <ResponsiveLine
      data={data}
      margin={{
        top: 10,
        right: type === "gse" ? 20 : 10,
        bottom: type === "gse" ? 70 : 50,
        left: 50,
      }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
      }}
      enableGridX={false}
      enableGridY={false}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: type === "gse" ? 15 : 5,
        tickPadding: 5,
        tickRotation: type === "gse" ? 90 : 0,
        legend: xLabel,
        legendOffset: 40,
        legendPosition: "middle",
        tickValues: tickValues,
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: yLabel,
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointSize={type === "gse" ? 0 : 7}
      pointBorderWidth={0.5}
      markers={
        data[0].data.length < 1
          ? null
          : markers(redLineLabel, redLine, max ? max : Infinity)
      }
      colors={["black"]}
      animate={false}
    />
  );
};

export default LineChart;
