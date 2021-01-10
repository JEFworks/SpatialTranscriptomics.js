import React, { Component } from "react";
import { ResponsiveBar } from "@nivo/bar";

const red = "#ff80ab";
const blue = "#80d8ff";
const getColor = (bar) => bar.data.color;

const setColor = (val, min) => {
  return val < min ? red : blue;
};

const markers = (min, loading) => [
  {
    axis: "x",
    value: min.toFixed(1),
    lineStyle: {
      stroke: !loading ? red : "transparent",
      strokeWidth: 1,
    },
  },
];

const xAxis = (label) => ({
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 0,
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

class Histogram extends Component {
  render() {
    const { props } = this;
    const { min, lowerLimit, upperLimit } = props;

    const data = !props.data
      ? []
      : props.data.slice(lowerLimit, upperLimit).map((datum) => {
          return {
            range: datum.range.toFixed(1),
            frequency: datum.frequency,
            color: setColor(datum.range, min),
          };
        });

    return (
      <>
        <ResponsiveBar
          theme={{ textColor: "black" }}
          data={data}
          keys={["frequency"]}
          indexBy="range"
          margin={{ top: 5, right: 0, bottom: 50, left: 45 }}
          colors={getColor}
          markers={markers(min, data.length < 1)}
          axisBottom={xAxis(props.xLabel)}
          axisLeft={yAxis}
          enableLabel={false}
          enableGridX={false}
          enableGridY={false}
          isInteractive={false}
        />
      </>
    );
  }
}

export default Histogram;
