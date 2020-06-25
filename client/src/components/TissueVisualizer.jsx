import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Map, ImageOverlay, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const style = { height: "80vh", width: "75vw" };

const headline = "#094067";
const paragraph = "#5f6c7b";

class TissueVisualizer extends Component {
  render() {
    const bounds = [
      [0, 0],
      [1000, 1000],
    ];
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: headline }}
          variant="h5"
        >
          Tissue Visualization
        </Typography>
        <Typography
          style={{ marginBottom: "20px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>
        <Map crs={L.CRS.Simple} minZoom={-4} bounds={bounds} style={style}>
          <ImageOverlay bounds={bounds} url="/images/tissue_image.png" />

          <Marker position={[500, 500]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </Map>
        {/* <Map style={{ height: "800px" }} crs={L.CRS.Simple}>
          <TileLayer url="../images/tissue_image.png" />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </Map> */}
      </>
    );
  }
}

export default TissueVisualizer;
