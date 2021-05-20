import React, { Component } from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

const blue = "#80d8ff";

const TitleContents = (props) => {
  const {
    selectFeature,
    setFeature,
    feature,
    selectK,
    setK,
    k,
    loading,
    hideInput,
    windowWidth,
  } = props.properties;
  const isMobile = windowWidth < 980;
  const isMobile2 = windowWidth < 650;

  return (
    <>
      <Typography
        variant="h6"
        style={{
          fontWeight: 500,
          marginRight: "25px",
          marginTop: isMobile ? "10px" : "0px",
          marginBottom: isMobile ? "10px" : "0px",
        }}
      >
        <Link underline="none" href="/">
          SpatialTranscriptomics.js
        </Link>
      </Typography>

      {!hideInput && (
        <div style={{ display: "flex", marginTop: isMobile ? "-5px" : "2px" }}>
          <div
            style={{
              display: isMobile ? "" : "flex",
              marginRight: isMobile ? "20px" : "30px",
            }}
          >
            <TextField
              style={{ width: "90px", fontWeight: 500, marginRight: "10px" }}
              color="secondary"
              helperText="Gene name"
              defaultValue="Nptxr"
              onChange={selectFeature}
            />
            <Button
              variant="contained"
              size="small"
              color="primary"
              style={{ marginTop: "15px", marginBottom: "15px" }}
              onClick={() => setFeature(feature)}
            >
              Color by Gene
            </Button>
          </div>

          <div style={{ display: "flex" }}>
            <div style={{ display: isMobile ? "" : "flex" }}>
              <TextField
                style={{ width: "100px", marginRight: "10px" }}
                color="secondary"
                helperText="# of Clusters (k)"
                defaultValue="10"
                onChange={selectK}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                style={{ marginTop: "15px", marginBottom: "15px" }}
                onClick={() => setK(k)}
              >
                Color by Clusters
              </Button>
            </div>

            {!isMobile2 && (
              <div style={{ marginLeft: "30px", marginTop: "10px" }}>
                <CircularProgress
                  disableShrink
                  size={40}
                  thickness={5}
                  style={{ color: !loading ? "transparent" : blue }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flexGrow: 1 }}></div>

      {!isMobile && (
        <>
          {aboutButton}
          {gitButton}
        </>
      )}
    </>
  );
};

const Title = (props) => {
  const contents = <TitleContents properties={props} />;

  if (props.windowWidth < 980) {
    return <div>{contents}</div>;
  }
  return <>{contents}</>;
};

const aboutButton = (
  <Typography
    style={{ fontSize: "1.1em", fontWeight: 500, marginRight: "5px" }}
  >
    <Link underline="none" href="/about">
      about
    </Link>
  </Typography>
);

const gitButton = (
  <IconButton
    disableRipple
    edge="end"
    color="primary"
    style={{
      marginRight: "-10px",
      marginBottom: "-4px",
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
    feature: "nptxr",
    k: 10,
  };

  componentDidMount = () => {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  };

  updateDimensions = () => {
    this.setState({ resize: true });
  };

  selectFeature = (event) => {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  };

  selectK = (event) => {
    const value = Number.parseInt(event.target.value);
    this.setState({ k: value });
  };

  render = () => {
    const { loading, hideInput } = this.props;
    const { feature, k } = this.state;

    return (
      <>
        <AppBar
          style={{
            backgroundColor: "#fff",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 12px",
          }}
        >
          <Toolbar>
            <Title
              selectFeature={this.selectFeature}
              setFeature={this.props.setFeature}
              feature={feature}
              selectK={this.selectK}
              setK={this.props.setK}
              k={k}
              loading={loading}
              hideInput={hideInput}
              windowWidth={window.innerWidth}
            />
          </Toolbar>
        </AppBar>
      </>
    );
  };
}

export default Header;
