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

const background = "#fffffe";
const primary = "#094067";
const blue = "#80d8ff";

const TitleContents = (
  selectFeature,
  setFeature,
  feature,
  selectK,
  setK,
  k,
  loading,
  noshow,
  isMobile,
  isMobile2
) => {
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
        <Link style={{ color: primary }} underline="none" href="/">
          SpatialTranscriptomics.js
        </Link>
      </Typography>

      {!noshow && (
        <div
          style={{
            display: "flex",
            marginTop: isMobile ? "-5px" : "2px",
            marginBottom: "0px",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: isMobile ? "" : "flex",
              marginRight: isMobile ? "20px" : "30px",
            }}
          >
            <TextField
              style={{ width: "90px", fontWeight: 500, marginRight: "10px" }}
              helperText="Gene name"
              defaultValue="Camk2n1"
              onChange={selectFeature}
            />
            <Button
              variant="contained"
              size="small"
              color="primary"
              style={{
                backgroundColor: primary,
                marginTop: "15px",
                marginBottom: "15px",
              }}
              onClick={() => setFeature(feature)}
            >
              Color by Gene
            </Button>
          </div>

          <div style={{ display: "flex" }}>
            <div style={{ display: isMobile ? "" : "flex" }}>
              <TextField
                style={{ width: "100px", marginRight: "10px" }}
                helperText="# of Clusters (k)"
                defaultValue="10"
                onChange={selectK}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                style={{
                  backgroundColor: primary,
                  marginTop: "15px",
                  marginBottom: "15px",
                }}
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

      {!isMobile && (
        <>
          {About}
          {Github}
        </>
      )}
    </>
  );
};

const Title = (
  selectFeature,
  setFeature,
  feature,
  selectK,
  setK,
  k,
  loading,
  noshow,
  isMobile,
  isMobile2
) => {
  const contents = TitleContents(
    selectFeature,
    setFeature,
    feature,
    selectK,
    setK,
    k,
    loading,
    noshow,
    isMobile,
    isMobile2
  );

  if (isMobile) {
    return <div>{contents}</div>;
  }
  return <>{contents}</>;
};

const About = (
  <Typography
    style={{ fontSize: "1.1em", fontWeight: 500, marginRight: "5px" }}
  >
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

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    this.setState({ resize: true });
  }

  selectFeature(event) {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  }

  selectK(event) {
    const value = Number.parseInt(event.target.value);
    this.setState({ k: value });
  }

  render() {
    const { setFeature, setK, loading, noshow } = this.props;
    const { feature, k } = this.state;

    const isMobile = window.innerWidth < 980;
    const isMobile2 = window.innerWidth < 650;

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
              k,
              loading,
              noshow,
              isMobile,
              isMobile2
            )}
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

export default Header;
