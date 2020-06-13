import React, { Component } from "react";
import { ResponsiveBar } from "@nivo/bar";

class BarGraph extends Component {
  render() {
    return (
      <>
        <ResponsiveBar
          data={this.props.data}
          keys={["frequency"]}
          indexBy="range"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          colors={{ scheme: "pastel2" }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "% of cells per gene",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
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
