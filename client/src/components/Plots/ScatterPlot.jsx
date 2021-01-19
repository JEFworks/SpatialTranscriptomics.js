import React, { Component } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

class Scatter extends Component {
  render() {
    const { props } = this;
    const { data, tsne, getColor, pcX, pcY, visible } = props;

    return (
      <>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 10, right: 10, bottom: 50, left: tsne ? 10 : 55 }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          xFormat={function (e) {
            return e + " kg";
          }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          yFormat={function (e) {
            return e + " cm";
          }}
          blendMode="normal"
          nodeSize={3}
          isInteractive={false}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={
            tsne
              ? null
              : {
                  orient: "bottom",
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: !visible ? "tsne" : "pc" + pcX,
                  legendPosition: "middle",
                  legendOffset: 40,
                }
          }
          axisLeft={
            tsne
              ? null
              : {
                  orient: "left",
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: !visible ? "tsne" : "pc" + pcY,
                  legendPosition: "middle",
                  legendOffset: -50,
                }
          }
          colors={getColor}
          animate={false}
        />
      </>
    );
  }
}

export default Scatter;
