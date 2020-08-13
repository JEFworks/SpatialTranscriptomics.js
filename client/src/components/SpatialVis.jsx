import React, { Component } from "react";
import { Map, ImageOverlay, Circle } from "react-leaflet";
import L from "leaflet";
import {
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";
const tertiary = "#90b4ce";

const LeafletWrapper = (p, colors) => {
  const bounds = [
    [0, 0],
    [1921, 2000],
  ];

  const pixels = p.slice().map((pixel, index) => {
    const coloredPixel = pixel;
    coloredPixel.color = colors[index];
    return coloredPixel;
  });

  return (
    <>
      <Map
        crs={L.CRS.Simple}
        minZoom={-2}
        bounds={bounds}
        style={{ height: "500px", width: "100%" }}
      >
        <ImageOverlay bounds={bounds} url="/images/tissue_image.png" />
        {pixels.map((pixel) => {
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

const TypedInput = (changeDeltaX, changeDeltaY, changeScale) => {
  return (
    <>
      <FormGroup row style={{ marginTop: "7px" }}>
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
              style={{ backgroundColor: "transparent", color: tertiary }}
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
              style={{ backgroundColor: "transparent", color: tertiary }}
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
              style={{ backgroundColor: "transparent", color: tertiary }}
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

class SpatialVis extends Component {
  state = {
    pixels: [],
    deltaX: 0,
    deltaY: 1965,
    scale: 0.176,
    horizontalFlipped: 1,
    verticalFlipped: -1,
    xyFlipped: false,
  };

  getPixels = this.getPixels.bind(this);
  changeDeltaX = this.changeDeltaX.bind(this);
  changeDeltaY = this.changeDeltaY.bind(this);
  changeScale = this.changeScale.bind(this);
  flipHorizontal = this.flipHorizontal.bind(this);
  flipVertical = this.flipVertical.bind(this);
  flipXY = this.flipXY.bind(this);

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

  run() {
    const pixels = this.getPixels();
    this.setState({ pixels });
  }

  getPixels() {
    const { barcodes, colors } = this.props;
    const pixels = [];

    if (colors && barcodes[0]) {
      if (!barcodes[0].x || !barcodes[0].y) return [];

      for (let i = 0; i < colors.length; i++) {
        try {
          const { x, y } = barcodes[i];
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
            color: null,
          });
        } catch (error) {}
      }
    }
    return pixels;
  }

  render() {
    const {
      changeDeltaX,
      changeDeltaY,
      changeScale,
      flipHorizontal,
      flipVertical,
      flipXY,
    } = this;
    const {
      pixels,
      horizontalFlipped,
      verticalFlipped,
      xyFlipped,
    } = this.state;
    const { colors } = this.props;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Spatial Visualization
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        {TypedInput(changeDeltaX, changeDeltaY, changeScale)}
        {CheckboxInput(
          horizontalFlipped,
          flipHorizontal,
          verticalFlipped,
          flipVertical,
          xyFlipped,
          flipXY
        )}

        <div style={{ paddingTop: "10px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Run Visualization
        </Button>
        <div style={{ paddingTop: "20px" }}></div>

        {LeafletWrapper(pixels, colors)}
      </>
    );
  }
}

export default SpatialVis;