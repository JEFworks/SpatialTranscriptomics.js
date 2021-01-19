import React, { Component } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

class Scatter extends Component {
  render() {
    const { props } = this;
    const { data, getColor, pcX, pcY, visible, type } = props;

    let axisBottom = null;
    if (type === "pca" || type === "diffExp") {
      let legend = !visible ? "" : `pc${pcX}`;
      if (type === "diffExp") {
        legend = "log2(fold-change)";
      }

      axisBottom = {
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: legend,
        legendPosition: "middle",
        legendOffset: 40,
      };
    }

    let axisLeft = null;
    if (type === "pca" || type === "diffExp") {
      let legend = !visible ? "" : `pc${pcY}`;
      if (type === "diffExp") {
        legend = "-log10(p-value)";
      }

      axisLeft = {
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: legend,
        legendPosition: "middle",
        legendOffset: type === "diffExp" ? -40 : -50,
      };
    }

    let marginLeft = 10;
    if (type === "pca") {
      marginLeft = 55;
    } else if (type === "diffExp") {
      marginLeft = 45;
    }

    let nodeSize = 3;
    if (type === "diffExp") {
      nodeSize = 5;
    }

    return (
      <>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 10, right: 10, bottom: 50, left: marginLeft }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          blendMode="normal"
          nodeSize={nodeSize}
          isInteractive={false}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottom}
          axisLeft={axisLeft}
          colors={getColor}
          animate={false}
        />
      </>
    );
  }
}

export default Scatter;
