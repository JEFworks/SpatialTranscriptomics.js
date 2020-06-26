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

const log = (value) => {
  return Math.log10(value + 1);
};

const normalize = (value, min, max) => {
  return (value - min) / (max - min);
};

const zscore = (value, mean, sd) => {
  return (value - mean) / sd;
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

class TissueVisualization extends Component {
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

    // summedGenes = summedGenes.sort((a, b) => {
    //   return b.sum - a.sum;
    // });

    for (let i = 0; i < summedGenes.length; i++) {
      if (i > 50) break;
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

      const mean = d3.mean(gene);
      const sd = d3.deviation(gene);
      const max = d3.max(gene);
      const min = d3.min(gene);

      gene.forEach((cell, index) => {
        try {
          const { x, y } = barcodes[index];

          // let value = zscore(cell, mean, sd); // meh
          let value = normalize(cell, min, max); // good
          // let value = normalize(log(cell), log(min), log(max)); // ass

          // const start = { r: 0, g: 0, b: 255 };
          // const end = { r: 255, g: 0, b: 0 };

          // const r = (end.r - start.r) * value + start.r;
          // const g = (end.g - start.g) * value + start.g;
          // const b = (end.b - start.b) * value + start.b;

          const color = [
            [0, 0, 255],
            [255, 255, 255],
            [255, 0, 0],
          ];
          value *= 2;
          let idx1 = Math.floor(value);
          let idx2 = idx1 + 1;
          let fractBetween = value - idx1;

          if (value <= 0) {
            idx1 = 0;
            idx2 = 0;
          } else if (value >= 1) {
            idx1 = 2;
            idx2 = 2;
          }

          let r =
            (color[idx2][0] - color[idx1][0]) * fractBetween + color[idx1][0];
          let g =
            (color[idx2][1] - color[idx1][1]) * fractBetween + color[idx1][1];
          let b =
            (color[idx2][2] - color[idx1][2]) * fractBetween + color[idx1][2];

          pixels.push({
            center: [Number.parseFloat(x) / 5.7, Number.parseFloat(y) / 5.7],
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
          Tissue Visualization
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

export default TissueVisualization;
