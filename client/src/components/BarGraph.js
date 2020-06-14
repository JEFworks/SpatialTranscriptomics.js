import React, { Component } from "react";
import { ResponsiveBar } from "@nivo/bar";

const red = "#ff80ab";
const green = "#80d8ff";

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
          margin={{ top: 5, right: 0, bottom: 50, left: 40 }}
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
            legend: this.props.xLabel,
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
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
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
