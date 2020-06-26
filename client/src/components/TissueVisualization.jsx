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

const normalize = (value, mean, sd) => {
  return (value - mean) / sd;
};

const standardDeviation = (values) => {
  var avg = average(values);

  var squareDiffs = values.map(function (value) {
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
};

const average = (data) => {
  var sum = data.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
};

const Selector = (list, indices, value, handleChange) => {
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

    summedGenes = summedGenes.sort((a, b) => {
      return b.sum - a.sum;
    });

    for (let i = 0; i < summedGenes.length; i++) {
      // if (i > 10) break;
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

    const color = [
      [0, 0, 255], // blue
      [255, 255, 255], // white
      [255, 0, 0], // red
    ];

    if (gene && barcodes[0]) {
      if (!barcodes[0].x || !barcodes[0].y) return [];
      let mean = average(gene);
      let sd = standardDeviation(gene);

      let min = normalize(gene[0], mean, sd);
      let max = 0;
      gene.forEach((cell) => {
        const val = normalize(cell, mean, sd);
        if (val < min) min = val;
        if (val > max) max = val;
      });

      gene.forEach((cell, index) => {
        try {
          const x = barcodes[index].x;
          const y = barcodes[index].y;
          let value = normalize(cell, mean, sd);
          value = (value - min) / (max - min);

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
    console.log(pixels);
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
