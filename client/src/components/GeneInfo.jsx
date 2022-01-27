import React, { Component } from "react";
import axios from "axios";
import api from "../api.jsx";
import {
  Typography,
  Button,
  FormGroup,
  TextField,
  Paper,
} from "@material-ui/core";
import {
  VictoryChart,
  VictoryBoxPlot,
  VictoryAxis,
  VictoryZoomContainer,
  VictoryLabel,
} from "victory";
import Title from "./Plots/PlotTitle.jsx";

const stjsAPI = axios.create({ baseURL: api });

const paragraph = "rgba(0, 0, 0, 0.54)";

const Info = (props) => {
  const { geneName, textArray } = props;

  return (
    <Paper
      className="geneinfo-plot"
      style={{ overflowY: "auto" }}
      variant="outlined"
      elevation={3}
    >
      <div style={{ margin: "0 25px 5px 0" }}>
        <Title title={"Gene Information"} />
      </div>

      <div style={{ marginBottom: "20px", marginRight: "20px" }}>
        <Typography
          style={{ fontWeight: 500, marginBottom: "5px" }}
          variant="body2"
        >
          {geneName}
        </Typography>
        {textArray.map((entry, i) => {
          const { textSectionContent, textSectionTitle } = entry.textSection;
          return (
            <div key={i}>
              <Typography
                style={{
                  fontWeight: 400,
                  fontStyle: "italic",
                  marginBottom: "5px",
                }}
                variant="body2"
              >
                {textSectionTitle}
              </Typography>
              <Typography
                style={{
                  fontWeight: 400,
                  textAlign: "justify",
                  textJustify: "inter-word",
                  marginBottom: "10px",
                }}
                variant="body2"
              >
                {textSectionContent.replaceAll("{", "").replaceAll("}", "")}
              </Typography>
            </div>
          );
        })}
      </div>
    </Paper>
  );
};

const Plot = (props) => {
  const getColor = (datum) => {
    const { x } = datum;
    return x === "All" ? "black" : props.colors[parseInt(x) - 1];
  };

  const Boxplot = (
    <VictoryChart
      height={450}
      width={550}
      domainPadding={30}
      containerComponent={<VictoryZoomContainer zoomDimension="x" />}
    >
      <VictoryBoxPlot
        boxWidth={25}
        data={props.data}
        style={{
          q1: { fill: ({ datum }) => getColor(datum) },
          q3: { fill: ({ datum }) => getColor(datum) },
          min: { stroke: ({ datum }) => getColor(datum) },
          max: { stroke: ({ datum }) => getColor(datum) },
          median: { stroke: "white", strokeWidth: 2 },
        }}
      />
      <VictoryAxis
        dependentAxis
        crossAxis
        label={"# of reads per cell"}
        axisLabelComponent={<VictoryLabel dy={-15} />}
      />
      <VictoryAxis crossAxis />
    </VictoryChart>
  );

  return (
    <Paper className="geneinfo-plot" variant="outlined" elevation={3}>
      <div style={{ margin: "0 25px -15px 0" }}>
        <Title title={"Expression Box Plot"} />
      </div>
      {props.data[0] && Boxplot}
    </Paper>
  );
};

const TypedInput = (props) => {
  const { onChange } = props;

  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "90px" }}
        color="secondary"
        helperText="Gene name"
        defaultValue="Nptxr"
        onChange={onChange}
      />
    </FormGroup>
  );
};

class GeneInfo extends Component {
  state = { feature: "nptxr", title: "", textArray: [] };

  setFeature = (event) => {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  };

  run = () => {
    const { feature } = this.state;

    // compute boxplot statistics
    this.props.computeBoxplot(feature);

    // get information about gene from OMIM
    stjsAPI
      .get("/omim", { params: { geneName: feature } })
      .then((response) => {
        const data = JSON.parse(response.data);
        const { title, textArray } = data;
        this.setState({ title, textArray });
      })
      .catch((error) => {
        this.props.reportError(error);
        this.setState({ title: "", textArray: [] });
      });
  };

  render = () => {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500 }}
          color="primary"
          variant="h5"
        >
          Gene Expression
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Run this module to view a gene's expression levels across groups, and
          view info about the gene from OMIM.
          <br></br>
          (will change to bar graph of average gene expression in each cluster)
        </Typography>

        <TypedInput onChange={this.setFeature} />

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={this.run}
        >
          Run
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="GeneInfo-flex">
            <Plot data={this.props.boxplotData} colors={this.props.colors} />
            <Info
              geneName={this.state.title}
              textArray={this.state.textArray}
            />
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  };
}

export default GeneInfo;