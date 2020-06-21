import React, { Component } from "react";
import { ResponsiveBar } from "@nivo/bar";

const red = "#ff80ab";
const blue = "#80d8ff";

const setColor = (datum, min) => {
  if (datum.range < min) return red;
  else return blue;
};

const getColor = (bar) => bar.data.color;

class BarGraph extends Component {
  render() {
    const { props } = this;
    const min = props.min;
    const data = props.data.map((datum) => ({
      ...datum,
      color: setColor(datum, min),
      range: datum.range * 100 + "%",
    }));

    return (
      <>
        <ResponsiveBar
          data={data}
          keys={["frequency"]}
          indexBy="range"
          margin={{ top: 5, right: 0, bottom: 50, left: 45 }}
          colors={getColor}
          markers={[
            {
              axis: "x",
              value: min * 100 + "%",
              lineStyle: {
                stroke: data.length > 0 ? red : "transparent",
                strokeWidth: 1,
                borderStyle: "dotted",
              },
            },
          ]}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: props.xLabel,
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 1,
            tickPadding: 5,
            tickRotation: 0,
            legend: "frequency",
            legendPosition: "middle",
            legendOffset: -40,
          }}
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
