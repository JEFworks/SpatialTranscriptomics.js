import React, { Component } from "react";
import axios from "axios";
import omimApiKey from "../omimApiKey.jsx";
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
} from "victory";

const paragraph = "rgba(0, 0, 0, 0.54)";

const Info = (props) => {
  return <></>;
};

const Plot = (props) => {
  const getColor = (datum) => {
    const { x } = datum;
    return x === "All" ? "black" : props.colors[parseInt(x) - 1];
  };

  const Title = (
    <Typography
      variant="body1"
      align="center"
      color="primary"
      style={{ fontWeight: 500 }}
    >
      {"Gene Box Plot.."}
    </Typography>
  );

  const Boxplot = (
    <VictoryChart
      height={400}
      width={450}
      domainPadding={20}
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
      <VictoryAxis dependentAxis crossAxis />
      <VictoryAxis crossAxis />
    </VictoryChart>
  );

  return (
    <div>
      <Paper
        className="boxplot"
        style={{
          padding: "15px 0 0 0",
          backgroundColor: "transparent",
        }}
        variant="outlined"
        elevation={3}
      >
        {Title}
        {props.data[0] && Boxplot}
      </Paper>
    </div>
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
    this.props.computeBoxplot(feature);

    axios
      .get(
        `https://api.omim.org/api/entry/search?search=${feature}&include=text:description&include=text:cloning&format=json&start=0&limit=1&apiKey=${omimApiKey}`
      )
      .then((response) => {
        const {
          textSectionList,
          titles,
        } = response.data.omim.searchResponse.entryList[0].entry;

        this.setState({
          title: titles.preferredTitle,
          textArray: textSectionList,
        });
      })
      .catch((_error) => {
        this.props.reportError("Gene info could not be retrieved from OMIM.\n");
      });
  };

  render() {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500 }}
          color="primary"
          variant="h5"
        >
          Gene info...
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          First line of description...
          <br></br>
          Second line of description...
        </Typography>

        <TypedInput onChange={this.setFeature} />

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={this.run}
        >
          Run ...
        </Button>

        {/* <p>{this.state.title}</p>
        {this.state.textArray.map((entry, i) => {
          const { textSectionContent, textSectionTitle } = entry.textSection;
          return (
            <div key={i}>
              <div>{textSectionTitle}</div>
              <div>{textSectionContent}</div>
            </div>
          );
        })} */}
        {/* <Info /> */}

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <Plot data={this.props.boxplotData} colors={this.props.colors} />
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default GeneInfo;
