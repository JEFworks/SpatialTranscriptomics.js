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
  CircularProgress,
} from "@material-ui/core";

const paragraph = "rgba(0, 0, 0, 0.54)";
const secondary = "#90b4ce";
const blue = "#80d8ff";

const LeafletWrapper = (props) => {
  const { pixels, colors, opacity, pixelSize, imageLink } = props;
  const bounds = [
    [0, 0],
    [1921, 2000],
  ];

  return (
    <Map
      crs={L.CRS.Simple}
      minZoom={-2}
      bounds={bounds}
      style={{ height: "500px", width: "100%" }}
    >
      <ImageOverlay bounds={bounds} url={imageLink} />
      {pixels.length === colors.length &&
        pixels.map((pixel, index) => {
          return (
            <Circle
              key={pixel.center}
              center={pixel.center}
              color="transparent"
              fillColor={colors[index] ? colors[index] : "blue"}
              fillOpacity={opacity}
              radius={pixelSize}
            />
          );
        })}
    </Map>
  );
};

const TypedInput = (props) => {
  const {
    changeDeltaX,
    changeDeltaY,
    changeScale,
    changeOpacity,
    changePixelSize,
  } = props;

  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "50px", marginRight: "15px" }}
        color="secondary"
        helperText="ΔX"
        defaultValue="30"
        onChange={changeDeltaX}
      />
      <TextField
        style={{ width: "50px", marginRight: "15px" }}
        color="secondary"
        helperText="ΔY"
        defaultValue="1945"
        onChange={changeDeltaY}
      />
      <TextField
        style={{ width: "250px", marginRight: "15px" }}
        color="secondary"
        helperText="Scale (< 1 to downscale or > 1 to upscale)"
        defaultValue="0.170"
        onChange={changeScale}
      />
      <TextField
        style={{ width: "90px", marginRight: "15px" }}
        color="secondary"
        helperText="Opacity (0 - 1)"
        defaultValue="1"
        onChange={changeOpacity}
      />
      <TextField
        style={{ width: "60px" }}
        color="secondary"
        helperText="Pixel Size"
        defaultValue="8"
        onChange={changePixelSize}
      />
    </FormGroup>
  );
};

const CheckboxInput = (props) => {
  const {
    horizontalFlipped,
    flipHorizontal,
    verticalFlipped,
    flipVertical,
    xyFlipped,
    flipXY,
  } = props;

  return (
    <FormGroup row style={{ marginTop: "5px" }}>
      <FormControlLabel
        control={
          <Checkbox
            disableRipple
            style={{ color: secondary }}
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
            style={{ color: secondary }}
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
            style={{ color: secondary }}
            checked={xyFlipped}
            onChange={flipXY}
          />
        }
        label="Swap X and Y Coordinates"
      />
    </FormGroup>
  );
};

class SpatialVis extends Component {
  state = {
    pixels: [],
    deltaX: 30,
    deltaY: 1945,
    scale: 0.17,
    horizontalFlipped: 1,
    verticalFlipped: -1,
    xyFlipped: false,
    opacity: 1,
    updatedOpacity: 1,
    pixelSize: 8,
    updatedPixelSize: 8,
  };

  changeScale = (event) => {
    const scale = Number.parseFloat(event.target.value);
    this.setState({ scale: scale });
  };

  changeDeltaX = (event) => {
    const deltaX = Number.parseInt(event.target.value);
    this.setState({ deltaX: deltaX });
  };

  changeDeltaY = (event) => {
    const deltaY = Number.parseInt(event.target.value);
    this.setState({ deltaY: deltaY });
  };

  changeOpacity = (event) => {
    const opacity = Number.parseFloat(event.target.value);
    this.setState({ updatedOpacity: opacity });
  };

  changePixelSize = (event) => {
    const pixelSize = Number.parseInt(event.target.value);
    this.setState({ updatedPixelSize: pixelSize });
  };

  flipHorizontal = () => {
    this.setState({ horizontalFlipped: this.state.horizontalFlipped * -1 });
  };

  flipVertical = () => {
    this.setState({ verticalFlipped: this.state.verticalFlipped * -1 });
  };

  flipXY = () => {
    this.setState({ xyFlipped: !this.state.xyFlipped });
  };

  run = () => {
    const {
      deltaX,
      deltaY,
      scale,
      updatedOpacity,
      updatedPixelSize,
    } = this.state;

    if (
      isNaN(deltaX) ||
      isNaN(deltaY) ||
      isNaN(scale) ||
      isNaN(updatedOpacity) ||
      isNaN(updatedPixelSize)
    ) {
      this.props.reportError(
        "Please specify a number value for each parameter.\n"
      );
      return;
    }

    const pixels = this.getPixels();
    this.setState({
      pixels,
      opacity: updatedOpacity,
      pixelSize: updatedPixelSize,
    });
  };

  getPixels = () => {
    const { barcodes, reportError, colors } = this.props;
    const pixels = [];

    if (colors.length === 0) {
      reportError("Matrix is empty and/or has not loaded yet.\n");
      return pixels;
    }

    if (barcodes[0] != null) {
      if (barcodes[0].x == null || barcodes[0].y == null) {
        reportError(
          "Information about the location of one or more pixels is missing and/or has not loaded yet.\n"
        );
        return [];
      }

      for (let i = 0; i < barcodes.length; i++) {
        try {
          // x is the x-coordinate, y is the y-coordinate
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
          });
        } catch (_error) {}
      }
    } else {
      reportError("Barcodes information is empty and/or has not loaded yet.\n");
    }
    return pixels;
  };

  render = () => {
    const {
      pixels,
      horizontalFlipped,
      verticalFlipped,
      xyFlipped,
      opacity,
      pixelSize,
    } = this.state;
    const { colors, imageLink } = this.props;
    const isMobile = window.innerWidth < 700;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500 }}
          color="primary"
          variant="h5"
        >
          Spatial Visualization
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Run this visualization to map results spatially onto the tissue.
        </Typography>

        <div style={{ display: "flex" }}>
          <div>
            <TypedInput
              changeDeltaX={this.changeDeltaX}
              changeDeltaY={this.changeDeltaY}
              changeScale={this.changeScale}
              changeOpacity={this.changeOpacity}
              changePixelSize={this.changePixelSize}
            />
            <CheckboxInput
              horizontalFlipped={horizontalFlipped}
              verticalFlipped={verticalFlipped}
              xyFlipped={xyFlipped}
              flipHorizontal={this.flipHorizontal}
              flipVertical={this.flipVertical}
              flipXY={this.flipXY}
            />
          </div>

          {!isMobile && this.props.loading && (
            <CircularProgress
              disableShrink
              size={40}
              thickness={5}
              style={{ color: blue, marginTop: "14px", marginLeft: "30px" }}
            />
          )}
        </div>

        <div style={{ paddingTop: "10px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={this.run}
        >
          Run Visualization
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <LeafletWrapper
          pixels={pixels}
          colors={colors}
          opacity={opacity}
          pixelSize={pixelSize}
          imageLink={imageLink}
        />
      </>
    );
  };
}

export default SpatialVis;
