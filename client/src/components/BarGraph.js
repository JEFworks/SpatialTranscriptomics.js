import React, { Component } from "react";
import { ResponsiveBar } from "@nivo/bar";

const red = "#F1B7B0";
const green = "#BDE1CE";

const setColor = (datum, min) => {
  if (datum.range < min) return red;
  else return green;
};

const getColor = (bar) => bar.data.color;

class BarGraph extends Component {
  render() {
    const min = this.props.min;
    const data = this.props.data.map((datum) => ({
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
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          colors={getColor}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
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
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "% of cells per detected gene",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 1,
            tickPadding: 5,
            tickRotation: 0,
            legend: "frequency",
            legendPosition: "middle",
            legendOffset: -35,
          }}
          enableGridY={true}
          enableLabel={false}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
        />
      </>
    );
  }
}

export default BarGraph;
