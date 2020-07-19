import React, { Component } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

const red = "#ff80ab";
const blue = "#80d8ff";

class Scatter extends Component {
  render() {
    const { props } = this;
    const { data } = props;

    return (
      <>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
          xScale={{ type: "linear", min: -0.05, max: "auto" }}
          xFormat={function (e) {
            return e + " kg";
          }}
          yScale={{ type: "linear", min: -0.05, max: "auto" }}
          yFormat={function (e) {
            return e + " cm";
          }}
          blendMode="multiply"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "pc1",
            legendPosition: "middle",
            legendOffset: 36,
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "pc2",
            legendPosition: "middle",
            legendOffset: -45,
          }}
        />
      </>
    );
  }
}

export default Scatter;
