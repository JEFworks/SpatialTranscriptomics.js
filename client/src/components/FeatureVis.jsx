import React, { Component } from "react";
import {
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Map, ImageOverlay, Circle } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

const primary = "#094067";
const paragraph = "#5f6c7b";
const buttonColor = "#90b4ce";

const normalize = (val, min, max) => {
  return (val - min) / (max - min);
};

const getRGB = (val, min, max) => {
  const colors = [
    [0, 0, 255],
    [255, 255, 255],
    [255, 0, 0],
  ];

  let value = normalize(val, min, max);
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

  const r = (colors[index2][0] - colors[index1][0]) * fract + colors[index1][0];
  const g = (colors[index2][1] - colors[index1][1]) * fract + colors[index1][1];
  const b = (colors[index2][2] - colors[index1][2]) * fract + colors[index1][2];

  return `rgb(${r},${g},${b})`;
};

const LeafletWrapper = (getPixels) => {
  const bounds = [
    [0, 0],
    [1921, 2000],
  ];

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
              key={pixel.center}
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

const TypedInput = (selectGene, changeDeltaX, changeDeltaY, changeScale) => {
  return (
    <>
      <FormGroup row style={{ marginTop: "7px" }}>
        <TextField
          style={{ width: "150px", marginRight: "15px" }}
          helperText="Feature name"
          defaultValue="Nptxr"
          onChange={selectGene}
        />
        <TextField
          style={{ width: "50px", marginRight: "15px" }}
          helperText="ΔX"
          defaultValue="0"
          onChange={changeDeltaX}
        />
        <TextField
          style={{ width: "50px", marginRight: "15px" }}
          helperText="ΔY"
          defaultValue="1965"
          onChange={changeDeltaY}
        />
        <TextField
          style={{ width: "250px" }}
          helperText="Scale (< 1 to downscale or > 1 to upscale)"
          defaultValue="0.176"
          onChange={changeScale}
        />
      </FormGroup>
    </>
  );
};

const CheckboxInput = (
  horizontalFlipped,
  flipHorizontal,
  verticalFlipped,
  flipVertical,
  xyFlipped,
  flipXY
) => {
  return (
    <>
      <FormGroup row style={{ marginTop: "5px" }}>
        <FormControlLabel
          control={
            <Checkbox
              disableRipple
              style={{ backgroundColor: "transparent", color: buttonColor }}
              checked={horizontalFlipped === -1}
              onChange={flipHorizontal}
            />
          }
          label="Flip Horizontally"
        />
        <FormControlLabel
          control={
            <Checkbox
              disableRipple
              style={{ backgroundColor: "transparent", color: buttonColor }}
              checked={verticalFlipped === -1}
              onChange={flipVertical}
            />
          }
          label="Flip Vertically"
        />
        <FormControlLabel
          control={
            <Checkbox
              disableRipple
              style={{ backgroundColor: "transparent", color: buttonColor }}
              checked={xyFlipped}
              onChange={flipXY}
            />
          }
          label="Swap X and Y Coordinates"
        />
      </FormGroup>
    </>
  );
};

class FeatureVis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feature: "nptxr",
      deltaX: 0,
      deltaY: 1965,
      scale: 0.176,
      horizontalFlipped: 1,
      verticalFlipped: -1,
      xyFlipped: false,
    };

    this.getPixels = this.getPixels.bind(this);
    this.selectGene = this.selectGene.bind(this);
    this.changeDeltaX = this.changeDeltaX.bind(this);
    this.changeDeltaY = this.changeDeltaY.bind(this);
    this.changeScale = this.changeScale.bind(this);
    this.flipHorizontal = this.flipHorizontal.bind(this);
    this.flipVertical = this.flipVertical.bind(this);
    this.flipXY = this.flipXY.bind(this);
  }

  selectGene(event) {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  }

  changeScale(event) {
    const scale = Number.parseFloat(event.target.value);
    this.setState({ scale: isNaN(scale) ? 1 : scale });
  }

  changeDeltaX(event) {
    const deltaX = Number.parseInt(event.target.value);
    this.setState({ deltaX: isNaN(deltaX) ? 0 : deltaX });
  }

  changeDeltaY(event) {
    const deltaY = Number.parseInt(event.target.value);
    this.setState({ deltaY: isNaN(deltaY) ? 0 : deltaY });
  }

  flipHorizontal() {
    this.setState({ horizontalFlipped: this.state.horizontalFlipped * -1 });
  }

  flipVertical() {
    this.setState({ verticalFlipped: this.state.verticalFlipped * -1 });
  }

  flipXY() {
    this.setState({ xyFlipped: !this.state.xyFlipped });
  }

  getPixels() {
    const { props } = this;
    const { barcodes } = props;
    const pixels = [];
    const gene = props.matrix[props.features.indexOf(this.state.feature)];

    if (gene && barcodes[0]) {
      if (!barcodes[0].x || !barcodes[0].y) return [];

      const mean = d3.mean(gene);
      const sd = d3.deviation(gene);
      const upperLimit = mean + 2 * sd;
      const lowerLimit = mean - 2 * sd;
      const max = Math.min(d3.max(gene), upperLimit);
      const min = Math.max(lowerLimit, d3.min(gene));

      gene.forEach((cell, index) => {
        try {
          const { x, y } = barcodes[index];
          const {
            xyFlipped,
            verticalFlipped,
            deltaY,
            horizontalFlipped,
            deltaX,
            scale,
          } = this.state;

          const centerX = verticalFlipped * x * scale + deltaY;
          const centerY = horizontalFlipped * y * scale + deltaX;
          pixels.push({
            center: !xyFlipped ? [centerX, centerY] : [centerY, centerX],
            color: getRGB(cell, min, max),
          });
        } catch (error) {}
      });
    }
    return pixels;
  }

  render() {
    const {
      getPixels,
      selectGene,
      changeDeltaX,
      changeDeltaY,
      changeScale,
      flipHorizontal,
      flipVertical,
      flipXY,
    } = this;
    const { horizontalFlipped, verticalFlipped, xyFlipped } = this.state;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
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

        {TypedInput(selectGene, changeDeltaX, changeDeltaY, changeScale)}
        {CheckboxInput(
          horizontalFlipped,
          flipHorizontal,
          verticalFlipped,
          flipVertical,
          xyFlipped,
          flipXY
        )}
        <div style={{ paddingTop: "10px" }}></div>

        {LeafletWrapper(getPixels)}
      </>
    );
  }
}

export default FeatureVis;
