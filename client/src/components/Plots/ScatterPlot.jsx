import React, { Component } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

const grey = "#DDDDDD";

const markers = [
  {
    axis: "x",
    value: 1,
    lineStyle: {
      stroke: grey,
      strokeWidth: 1,
    },
  },
  {
    axis: "x",
    value: -1,
    lineStyle: {
      stroke: grey,
      strokeWidth: 1,
    },
  },
  {
    axis: "y",
    value: 1.5,
    lineStyle: {
      stroke: grey,
      strokeWidth: 1,
    },
  },
];

class Scatter extends Component {
  render() {
    const { props } = this;
    const { data, getColor, pcX, pcY, visible, type } = props;

    let axisBottom = null;
    if (type === "pca" || type === "dge") {
      let legend = !visible ? "" : `PC ${pcX}`;
      if (type === "dge") {
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
    if (type === "pca" || type === "dge") {
      let legend = !visible ? "" : `PC ${pcY}`;
      if (type === "dge") {
        legend = "-log10(p-value)";
      }

      axisLeft = {
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: legend,
        legendPosition: "middle",
        legendOffset: type === "dge" ? -40 : -50,
      };
    }

    let marginLeft = 10;
    if (type === "pca") {
      marginLeft = 55;
    } else if (type === "dge") {
      marginLeft = 45;
    }

    let nodeSize = 3;
    if (type === "dge") {
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
          isInteractive={type === "dge" ? true : false}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottom}
          axisLeft={axisLeft}
          colors={getColor}
          animate={false}
          markers={type === "dge" && data[0].data.length > 0 ? markers : null}
          tooltip={({ node }) => {
            const { data } = node;
            if (
              data &&
              data.name &&
              data.y >= 1.5 &&
              (data.x >= 1 || data.x <= -1)
            ) {
              return (
                <div
                  style={{
                    color: "white",
                    background: "black",
                    fontSize: "14px",
                    padding: "5px",
                  }}
                >
                  <strong>{data.name}</strong>
                </div>
              );
            } else {
              return null;
            }
          }}
        />
      </>
    );
  }
}

export default Scatter;
