import React, { Component } from "react";
import {
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";
const blue = "#80d8ff";
const red = "#ff80ab";

const Plot = (gseResult, genesHave) => {
  const { geneSet, mhg, pvalue, threshold } = gseResult;
  console.log(mhg);
  console.log(geneSet);
  // return (
  //   <p>
  //     {data.pvalue}
  //   </p>
  // )
};

const Dropdown = (GSE, handleSelect, currSetID) => {
  return (
    <FormControl>
      <InputLabel>Age</InputLabel>
      <Select
        value={GSE.includes(currSetID) ? currSetID : ""}
        onChange={handleSelect}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {GSE.map((setID, i) => {
          return (
            <MenuItem value={setID} key={i}>
              {setID}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>Some important helper text</FormHelperText>
    </FormControl>
  );
};

class GSEWrapper extends Component {
  state = {
    setID: "",
  };

  handleSelect(event) {
    this.setState({ setID: event.target.value });
  }

  run() {
    const { computeGSE } = this.props;
    computeGSE();
  }

  render() {
    const { setID } = this.state;
    const { gseSolution, loading } = this.props;
    const { Genes, GSE } = gseSolution;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Gene Set Enrichment (GSE) Analysis
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          First line of description...
          <br></br>
          Second line of description...
        </Typography>

        <div style={{ display: "flex" }}>
          {Dropdown(
            GSE ? [...GSE.keys()] : [],
            this.handleSelect.bind(this),
            setID
          )}
          {loading && (
            <CircularProgress
              disableShrink
              size={40}
              thickness={5}
              style={{ color: blue, marginTop: "15px", marginLeft: "30px" }}
            />
          )}
        </div>

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Run GSE
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          {Plot(GSE && GSE.has(setID) ? GSE.get(setID) : {}, Genes)}
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default GSEWrapper;
