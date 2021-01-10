import React, { Component } from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
  Button,
  TextField,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

const background = "#fffffe";
const primary = "#094067";

const Title = (selectFeature, setFeature, feature, selectK, setK, k) => (
  <>
    <Typography variant="h6" style={{ flexGrow: 0.03, fontWeight: 500 }}>
      <Link style={{ color: primary }} underline="none" href="/">
        ST.js
      </Link>
    </Typography>
    <div style={{ flexGrow: 0.02, fontWeight: 500 }}>
      <TextField
        style={{ width: "100px" }}
        helperText="Gene name"
        defaultValue="Camk2n1"
        onChange={selectFeature}
      />
    </div>
    <div style={{ flexGrow: 0.95, fontWeight: 500 }}>
      <Button
        variant="contained"
        size="small"
        color="primary"
        style={{ backgroundColor: primary }}
        onClick={() => setFeature(feature)}
      >
        Update Colors
      </Button>
    </div>
    <div style={{ flexGrow: 0.02, fontWeight: 500 }}>
      <TextField
        style={{ width: "100px" }}
        helperText="K Num"
        defaultValue="10"
        onChange={selectK}
      />
    </div>
    <div style={{ flexGrow: 0.95, fontWeight: 500 }}>
      <Button
        variant="contained"
        size="small"
        color="primary"
        style={{ backgroundColor: primary }}
        onClick={() => setK(k)}
      >
        Update Clusters
      </Button>
    </div>
  </>
);

const About = (
  <Typography style={{ fontSize: "1.1em", fontWeight: 500 }}>
    <Link style={{ color: primary }} underline="none" href="/about">
      about
    </Link>
  </Typography>
);

const Github = (
  <IconButton
    disableRipple
    edge="end"
    style={{
      marginLeft: "5px",
      marginRight: "-10px",
      marginBottom: "-4px",
      color: primary,
      backgroundColor: "transparent",
    }}
    aria-label="menu"
  >
    <Link
      href="https://github.com/JEFworks/SpatialTranscriptomics.js"
      target="_blank"
      rel="noopener"
      color="inherit"
    >
      <GitHubIcon />
    </Link>
  </IconButton>
);

class Header extends Component {
  state = {
    feature: "camk2n1",
    k: 10,
  };

  selectFeature = this.selectFeature.bind(this);
  selectK = this.selectK.bind(this);

  selectFeature(event) {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  }

  selectK(event) {
    this.setState({ k: Number.parseInt(event.target.value) });
  }

  render() {
    const { setFeature, setK } = this.props;
    const { feature, k } = this.state;

    return (
      <>
        <AppBar
          style={{
            backgroundColor: background,
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 12px",
          }}
        >
          <Toolbar>
            {Title(
              this.selectFeature,
              setFeature,
              feature,
              this.selectK,
              setK,
              k
            )}
            {About}
            {Github}
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

export default Header;
