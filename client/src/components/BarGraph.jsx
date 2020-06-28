import React, { Component } from "react";
import { ResponsiveBar } from "@nivo/bar";

const red = "#ff80ab";
const blue = "#80d8ff";
const getColor = (bar) => bar.data.color;

const setColor = (val, min) => {
  if (val < min) return red;
  else return blue;
};

const markers = (min, loading) => [
  {
    axis: "x",
    value: Number(min).toFixed(1),
    lineStyle: {
      stroke: !loading ? red : "transparent",
      strokeWidth: 1,
      borderStyle: "dotted",
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
  tickRotation: 0,
  legend: "frequency",
  legendPosition: "middle",
  legendOffset: -40,
};

class BarGraph extends Component {
  render() {
    const { props } = this;
    const { min, lowerLimit, upperLimit } = props;

    const data = !props.data
      ? []
      : props.data.slice(lowerLimit, upperLimit).map((datum) => {
          return {
            range: Number(datum.range).toFixed(1),
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
          axisTop={null}
          axisRight={null}
          axisBottom={xAxis(props.xLabel)}
          axisLeft={yAxis}
          enableGridY={true}
          enableLabel={false}
          labelSkipWidth={12}
          labelSkipHeight={12}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      </>
    );
  }
}

export default BarGraph;
