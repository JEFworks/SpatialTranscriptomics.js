import React, { Component } from "react";
import axios from "axios";

import { Typography } from "@material-ui/core";
import { SparseMatrix } from "ml-sparse-matrix";
// import MatrixFile from "../data/matrix/matrix.mtx"

class Homepage extends Component {
  intervalID;

  constructor(props) {
    super(props);
    this.state = {
      sparseMatrix: new SparseMatrix(31053, 2698),
      count: 0,
    };
  }

  loadData() {
    for (let i = 0; i < 5; i++) {
      axios
        .get("http://localhost:4000/")
        .then((response) => {
          const array = JSON.parse(response.data);
          const s = new SparseMatrix(array);
          console.log(s.getNonZeros());
        })
        .catch((error) => {});
    }
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    return (
      <>
        <div className="site-container">
          <Typography variant="body1">Hello, world!</Typography>
        </div>
      </>
    );
  }
}

export default Homepage;
