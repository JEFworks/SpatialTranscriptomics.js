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

const primary = "#094067";
const paragraph = "#5f6c7b";
const blue = "#80d8ff";

const Plot = (setResult, genesHave) => {
  const result = setResult == null ? {} : setResult;
  const { geneSet, mhg, pvalue, threshold } = result;

  const obj = [{ id: "", data: [] }];
  if (mhg) {
    mhg.forEach((enrichmentScore, i) => {
      obj[0].data.push({ x: genesHave[i], y: enrichmentScore });
    });
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
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

const Dropdown = (setIDs, setIndex, handleSelect) => {
  return (
    <FormControl>
      <Select value={setIndex} onChange={handleSelect}>
        {setIDs.length === 0 && (
          <MenuItem value={-1}>
            <em>None</em>
          </MenuItem>
        )}
        {setIDs.map((setID, i) => {
          return (
            <MenuItem value={i} key={i}>
              {setID}
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

  handleSelect(event) {
    this.setState({ setIndex: event.target.value });
  }

  run() {
    const { computeGSE } = this.props;
    computeGSE();
    this.setState({ setIndex: 0 });
  }

  download(GSE, Genes) {
    if (GSE == null || Genes == null) {
      alert("Please run GSE first.");
      return;
    }

    const table = [
      ["GO term ID", "GO term name", "p-value", "genes", "enrichment score"],
    ];
    GSE.forEach((setResult, setID) => {
      const { geneSet, mhg, pvalue } = setResult;
      const goTerm = setID.replaceAll(",", "").split(" ");

      geneSet.forEach((geneName, i) => {
        const enrichmentScore = mhg[Genes.indexOf(geneName)];

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
  }

  render() {
    const { setIndex } = this.state;
    const { gseSolution, loading } = this.props;
    const { Genes, GSE } = gseSolution;

    const setIDs = GSE ? [...GSE.keys()] : [];
    const currSetIndex = setIDs.length > 0 ? setIndex : -1;

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

        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary, marginLeft: "10px" }}
          onClick={() => this.download(GSE, Genes)}
        >
          Download Results
        </Button>

        <div style={{ paddingTop: "15px", display: "flex" }}>
          {Dropdown(setIDs, currSetIndex, this.handleSelect.bind(this))}
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
          {Plot(GSE ? GSE.get(setIDs[currSetIndex]) : {}, Genes ? Genes : [])}
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default GSEWrapper;
