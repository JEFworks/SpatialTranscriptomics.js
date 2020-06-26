import React, { Component } from "react";
import { Typography, Select, MenuItem } from "@material-ui/core";
import { Map, ImageOverlay, Circle } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

const headline = "#094067";
const paragraph = "#5f6c7b";
const bounds = [
  [0, 0],
  [1921, 2000],
];

const normalize = (value, min, max) => {
  return (value - min) / (max - min);
};

const Selector = (list, indices, value, handleChange) => {
  return (
    <>
      <Select
        style={{ width: "150px", marginTop: "10px" }}
        value={list.length > 0 ? value : ""}
        onChange={handleChange}
      >
        <MenuItem key="" value="">
          <em>Select a Gene</em>
        </MenuItem>
        {list.map((element, index) => {
          return (
            <MenuItem key={element} value={indices[index]}>
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

class FeatureVis extends Component {
  constructor(props) {
    super(props);
    const topFeatures = [];
    const geneIndices = [];
    let summedGenes = [];

    props.matrix.forEach((gene, index) => {
      summedGenes.push({
        sum: gene.reduce((a, b) => {
          return a + b;
        }, 0),
        index: index,
      });
    });

    for (let i = 0; i < summedGenes.length; i++) {
      if (i > 10) break;
      topFeatures.push(props.features[summedGenes[i].index]);
      geneIndices.push(summedGenes[i].index);
    }

    this.state = {
      geneIndex: geneIndices[0],
      topFeatures,
      geneIndices,
    };

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

      const sd = d3.deviation(gene);
      const mean = d3.mean(gene);
      const upperLim = mean + 2 * sd;
      const lowerLim = mean - 2 * sd;

      const max = Math.min(d3.max(gene), upperLim);
      const min = Math.max(lowerLim, d3.min(gene));

      gene.forEach((cell, index) => {
        try {
          const colors = [
            [0, 0, 255],
            [255, 255, 255],
            [255, 0, 0],
          ];
          const { x, y } = barcodes[index];

          let value = normalize(cell, min, max);
          let index1;
          let index2;
          let fract = 0;
          if (value <= 0) {
            index1 = 0;
            index2 = 0;
          } else if (value >= 1) {
            index1 = colors.length - 1;
            index2 = colors.length - 1;
          } else {
            value = value * (colors.length - 1);
            index1 = Math.floor(value);
            index2 = index1 + 1;
            fract = value - index1;
          }

          const r =
            (colors[index2][0] - colors[index1][0]) * fract + colors[index1][0];
          const g =
            (colors[index2][1] - colors[index1][1]) * fract + colors[index1][1];
          const b =
            (colors[index2][2] - colors[index1][2]) * fract + colors[index1][2];

          const centerX = (-x + 11200) / 5.7;
          const centerY = y / 5.7;

          pixels.push({
            center: [centerX, centerY],
            color: "rgb(" + r + "," + g + "," + b + ")",
          });
        } catch (error) {}
      });
    }
    return pixels;
  }

  render() {
    const { selectGene, getPixels } = this;
    const { topFeatures, geneIndices, geneIndex } = this.state;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: headline }}
          variant="h5"
        >
          Feature Visualization
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        {Selector(topFeatures, geneIndices, geneIndex, selectGene)}
        <div style={{ marginBottom: "20px" }}></div>
        {LeafletContainer(getPixels)}
      </>
    );
  }
}

export default FeatureVis;
