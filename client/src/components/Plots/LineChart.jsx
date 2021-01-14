import React, { Component } from "react";
import { ResponsiveLine } from "@nivo/line";

const red = "#ff80ab";
const blue = "#80d8ff";

const markers = (max, loading) => [
  {
    axis: "x",
    value: max > 20 ? 20 : max,
    lineStyle: {
      stroke: !loading ? red : "transparent",
      strokeWidth: 1,
    },
  },
];

class LineChart extends Component {
  render() {
    const { props } = this;
    const { data, max } = props;

    return (
      <>
        <ResponsiveLine
          data={data}
          margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "principal components",
            legendOffset: 40,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "eigenvalues",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          pointSize={10}
          pointBorderWidth={0.5}
          markers={markers(max, data[0].data.length < 1)}
          colors={blue}
          animate={true}
        />
      </>
    );
  }
}

export default LineChart;
