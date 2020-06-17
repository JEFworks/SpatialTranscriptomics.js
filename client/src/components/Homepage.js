import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import QualityControl from "./QualityControl";

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matrix: [],
      features: [],
      loading: true,
    };
  }

  async loadFeatures() {
    axios
      .get(`http://localhost:4000/get-features`)
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
    const limit = numBatches;
    while (count < limit) {
      const merged = this.state.matrix;
      await axios
        .get(`http://localhost:4000/${count}/${numBatches}`)
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
              matrix: merged.concat(
                m.to2DArray().filter((gene, index) => {
                  gene.feature = this.state.features[index];
                  return gene.reduce((n, x) => n + (x > 0), 0) > 0;
                })
              ),
            });
          }
          console.log("Loaded batch #" + (batchNum + 1));
        })
        .catch((error) => {
          console.log(error);
        });
      count++;
    }

    this.setState({
      loading: false,
    });
  }

  componentDidMount() {
    this.loadFeatures().catch((error) => {
      console.log(error);
    });
    this.loadMatrix().catch((error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <>
        <div className="site-container">
          <QualityControl
            matrix={this.state.matrix}
            features={this.state.features}
            loading={this.state.loading}
          />
        </div>
      </>
    );
  }
}

export default Homepage;
