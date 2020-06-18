import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import QualityControl from "./QualityControl";

const rowSum = (gene) => {
  const count = gene.reduce((n, x) => n + (x > 0), 0);
  return count / gene.length;
};

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matrix: [],
      filteredMatrix: [],
      features: [],
      thresholds: [0.6, 0.6, 0.6],
      loading: true,
    };

    this.changeThreshold = this.changeThreshold.bind(this);
  }

  async loadFeatures() {
    axios
      .get(`http://localhost:4000/features`)
      .then((response) => {
        const features = JSON.parse(response.data);
        this.setState({ features });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async loadMatrix() {
    let count = 0;
    const numBatches = 4;
    while (count < numBatches) {
      await axios
        .get(`http://localhost:4000/matrix/${count}/${numBatches}`)
        .then((response) => {
          const res = JSON.parse(response.data);
          const batchNum = Number.parseInt(res.count);
          const m = new SparseMatrix(res.rows, res.columns);

          if (res.elements.distinct !== 0) {
            const elements = m.elements;
            elements.distinct = res.elements.distinct;
            elements.freeEntries = res.elements.freeEntries;
            elements.highWaterMark = res.elements.highWaterMark;
            elements.lowWaterMark = res.elements.lowWaterMark;
            elements.maxLoadFactor = res.elements.maxLoadFactor;
            elements.minLoadFactor = res.elements.minLoadFactor;
            elements.state = res.elements.state;
            elements.table = res.elements.table;
            elements.values = res.elements.values;
            this.setState({
              matrix: this.state.matrix.concat(
                m.to2DArray().filter((gene, index) => {
                  const ret = gene.reduce((n, x) => n + (x > 0), 0) > 0;
                  if (ret) gene.feature = this.state.features[index];
                  return ret;
                })
              ),
            });
          }
          console.log(`Loaded batch #${batchNum + 1}`);
        })
        .catch((error) => {
          this.setState({
            loading: false,
            matrix: [],
          });
          console.log(error);
          throw Error;
        });
      count++;
    }

    this.setState({
      filteredMatrix: this.state.matrix,
      loading: false,
    });
  }

  componentDidMount() {
    this.loadFeatures();
    this.loadMatrix().catch(() => {});
  }

  changeThreshold(filterType, threshold) {
    const thresholds = this.state.thresholds;
    if (filterType === "rowsum") thresholds[0] = threshold / 100;
    if (filterType === "colsum") thresholds[1] = threshold / 100;
    if (filterType === "mt") thresholds[2] = threshold / 100;

    // only implemented rowSum filtering so far...
    this.setState({
      thresholds,
      filteredMatrix: this.state.matrix.filter((gene) => {
        return rowSum(gene) >= thresholds[0];
      }),
    });
  }

  render() {
    return (
      <>
        <div className="site-container">
          <QualityControl
            matrix={this.state.matrix}
            filteredMatrix={this.state.filteredMatrix}
            features={this.state.features}
            loading={this.state.loading}
            thresholds={this.state.thresholds}
            changeThreshold={this.changeThreshold}
          />
        </div>
      </>
    );
  }
}

export default Homepage;
