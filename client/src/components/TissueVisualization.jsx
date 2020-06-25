import React, { Component } from "react";
import { Typography, Select, MenuItem } from "@material-ui/core";
import { Map, ImageOverlay, Circle } from "react-leaflet";
import L from "leaflet";

const headline = "#094067";
const paragraph = "#5f6c7b";
const bounds = [
  [0, 0],
  [1921, 2000],
];

const Selector = (list, value, handleChange) => {
  return (
    <>
      <Select
        defaultValue={list.length > 0 ? value : ""}
        value={list.length > 0 ? value : ""}
        style={{ width: "150px", marginTop: "10px" }}
        onChange={handleChange}
        displayEmpty
      >
        <MenuItem key={""} value={""}>
          <em>Select a Gene</em>
        </MenuItem>
        {list.map((element, index) => {
          return (
            <MenuItem key={index} value={index}>
              {element}
            </MenuItem>
          );
        })}
      </Select>
    </>
  );
};

const LeafletContainer = (getPixels) => {
  return (
    <>
      <Map
        crs={L.CRS.Simple}
        minZoom={-2}
        bounds={bounds}
        style={{ height: "500px", width: "100%" }}
      >
        <ImageOverlay bounds={bounds} url="/images/tissue_image.png" />
        {getPixels().map((pixel) => {
          return (
            <Circle
              key={pixel.center.toString()}
              center={pixel.center}
              color="transparent"
              fillColor={pixel.color}
              fillOpacity={1}
              radius={8}
            />
          );
        })}
      </Map>
    </>
  );
};

class TissueVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = { geneIndex: 0 };
    this.selectGene = this.selectGene.bind(this);
    this.getPixels = this.getPixels.bind(this);
  }

  selectGene(event) {
    this.setState({ geneIndex: event.target.value });
  }

  getPixels() {
    const { props } = this;
    const gene = props.matrix[this.state.geneIndex];
    const barcodes = props.barcodes;
    const pixels = [];

    if (gene && barcodes[0]) {
      if (!barcodes[0].x || !barcodes[0].y) return [];
      let max = 0;
      let min = Math.log10(gene[0] + 1);
      for (let i = 0; i < gene.length; i++) {
        const val = Math.log(gene[i] + 1);
        if (val > max) max = val;
        if (val < min) min = val;
      }

      gene.forEach((cell, index) => {
        try {
          const x = barcodes[index].x;
          const y = barcodes[index].y;
          const value = Math.log(cell + 1);
          pixels.push({
            center: [Number.parseFloat(x) / 5.7, Number.parseFloat(y) / 5.7],
            color:
              "rgb(" +
              (255 * ((value - min) / (max - min)) + 0) +
              "," +
              0 +
              "," +
              (-255 * ((value - min) / (max - min)) + 255) +
              ")",
          });
        } catch (error) {}
      });
    }
    return pixels;
  }

  render() {
    const { props, selectGene, getPixels } = this;
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: headline }}
          variant="h5"
        >
          Tissue Visualization
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        {Selector(
          props.features.slice(0, 10),
          this.state.geneIndex,
          selectGene
        )}
        <div style={{ marginBottom: "20px" }}></div>
        {LeafletContainer(getPixels)}
      </>
    );
  }
}

export default TissueVisualization;
