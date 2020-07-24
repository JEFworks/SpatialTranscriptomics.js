import React, { Component } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

class Scatter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { data } = props;

    return (
      <>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          xFormat={function (e) {
            return e + " kg";
          }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          yFormat={function (e) {
            return e + " cm";
          }}
          blendMode="normal"
          nodeSize={2}
          isInteractive={false}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "pc1",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "pc2",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          colors={props.getColor}
          animate={false}
        />
      </>
    );
  }
}

export default Scatter;
