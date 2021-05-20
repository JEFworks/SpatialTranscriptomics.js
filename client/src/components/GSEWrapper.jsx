import React, { Component } from "react";
import {
  Typography,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  FormHelperText,
  Paper,
} from "@material-ui/core";
import LineChart from "./Plots/LineChart.jsx";

const paragraph = "rgba(0, 0, 0, 0.54)";
const blue = "#80d8ff";

const Plot = (props) => {
  const { currResult, genesHave } = props;
  const result = currResult == null ? {} : currResult;
  const { geneSet, mhg, pvalue, threshold } = result;

  const obj = [{ id: "", data: mhg ? mhg : [] }];

  const Title = (
    <Typography
      variant="body1"
      align="center"
      color="primary"
      style={{ paddingBottom: "5px", fontWeight: 500 }}
    >
      Enrichment Plot
    </Typography>
  );

  const Linechart = (
    <div style={{ width: "100%", height: "100%" }}>
      <LineChart
        data={obj}
        redLine={genesHave[threshold]}
        redLineLabel={pvalue == null ? null : `P = ${pvalue.toFixed(3)}`}
        yLabel="enrichment"
        tickValues={geneSet}
        type={"gse"}
      />
    </div>
  );

  return (
    <div>
      <Paper
        className="gse-plot"
        style={{
          padding: "15px 15px 40px 15px",
          backgroundColor: "transparent",
        }}
        variant="outlined"
        elevation={3}
      >
        {Title}
        {Linechart}
      </Paper>
    </div>
  );
};

const Dropdown = (props) => {
  const { list, index, handleSelect } = props;
  return (
    <FormControl>
      <Select color="secondary" value={index} onChange={handleSelect}>
        {list.length === 0 && (
          <MenuItem value={-1}>
            <em>None</em>
          </MenuItem>
        )}
        {list.map((item, i) => {
          return (
            <MenuItem value={i} key={i}>
              {item}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>Select a GO term to visualize enrichment</FormHelperText>
    </FormControl>
  );
};

class GSEWrapper extends Component {
  state = {
    setIndex: -1,
  };

  handleSelect = (event) => {
    this.setState({ setIndex: event.target.value });
  };

  run = () => {
    const { computeGSE } = this.props;
    computeGSE();
    this.setState({ setIndex: 0 });
  };

  download = (GSE, Genes) => {
    if (GSE == null || Genes == null) {
      this.props.reportError("Please run GSE first.\n");
      return;
    }

    const table = [
      ["GO term ID", "GO term name", "p-value", "genes", "enrichment score"],
    ];
    GSE.forEach((currResult, setID) => {
      const { geneSet, mhg, pvalue } = currResult;
      const goTerm = setID.replaceAll(",", "").split(" ");

      geneSet.forEach((geneName, i) => {
        const enrichmentScore = mhg[Genes.indexOf(geneName)].y;

        if (i === 0) {
          table.push([
            goTerm[0],
            goTerm.slice(1).join(" "),
            pvalue,
            geneName,
            enrichmentScore,
          ]);
        } else {
          table.push(["", "", "", geneName, enrichmentScore]);
        }
      });
    });

    const CSV = table.join("\n");
    const element = document.createElement("a");
    const file = new Blob([CSV], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = "gse_results.csv";
    document.body.appendChild(element);
    element.click();
  };

  render = () => {
    const { setIndex } = this.state;
    const { gseSolution, loading } = this.props;
    const { Genes, GSE } = gseSolution;

    const setIDs = GSE ? [...GSE.keys()] : [];
    const currSetIndex = setIDs.length > 0 ? setIndex : -1;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500 }}
          color="primary"
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

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ marginRight: "10px" }}
          onClick={this.run}
        >
          Run GSE
        </Button>

        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => this.download(GSE, Genes)}
        >
          Download Results
        </Button>

        <div style={{ paddingTop: "15px", display: "flex" }}>
          <Dropdown
            list={setIDs}
            index={currSetIndex}
            handleSelect={this.handleSelect}
          />
          {loading && (
            <CircularProgress
              disableShrink
              size={40}
              thickness={5}
              style={{ color: blue, marginTop: "10px", marginLeft: "30px" }}
            />
          )}
        </div>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <Plot
            currResult={GSE ? GSE.get(setIDs[currSetIndex]) : {}}
            genesHave={Genes ? Genes : []}
          />
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  };
}

export default GSEWrapper;
