/* eslint-disable */
import { PCA } from "ml-pca";
import cpmNormalize from "../functions/cpmNormalize.jsx";

const getMean = (array) => {
  return array.reduce((a, b) => a + b) / array.length;
};

const transpose = (mat) => {
  const new_mat = [];

  const nrow = mat.length;
  const ncol = mat[0].length;

  for (let i = 0; i < nrow; i++) {
    const row = [];
    for (let j = 0; j < ncol; j++) {
      row.push(mat[i][j]);
    }
    new_mat.push(row);
  }

  return new_mat;
};

const center = (mat) => {
  const new_mat = [];
  const nrow = mat.length;
  const ncol = mat[0].length;

  for (let i = 0; i < nrow; i++) {
    const row = mat[i];
    const centered_row = [];
    const mean = getMean(row);

    for (let j = 0; j < ncol; j++) {
      centered_row.push(row[j] - mean);
    }
    new_mat.push(centered_row);
  }

  return new_mat;
};

export const performPCA = (m) => {
  const matrix = m; // this function does cpm norm and log10

  // matrix.map((x) => {
  //   console.log(x)
  // })

  // const test = [[2, 0, 8, 6, 0], [1, 6, 0, 1, 7], [5, 0, 7, 4, 0], [7, 0, 8, 5, 0]]

  // const test_pca = new PCA(transpose(center(test)), {
  //   method: "SVD",
  //   center: false,
  //   scale: false,
  //   ignoreZeroVariance: true,
  // });

  // const data = test_pca.getEigenvectors().data
  // data.map((x) => {
  //   console.log(x)
  // })

  // const values = test_pca.getEigenvalues();
  // console.log(values)

  const pca = new PCA(transpose(center(matrix)), {
    method: "SVD",
    center: false,
    scale: false,
    ignoreZeroVariance: true,
  });
  const pcs = pca.getEigenvectors().data;
  const eigenvalues = pca.getEigenvalues();

  // do this conversion because PCA function returns an array of Float64Array's
  const pcsCleaned = [];
  pcs.forEach((cell) => {
    pcsCleaned.push([].slice.call(cell));
  });

  // console.log(pcsCleaned[0])

  self.postMessage({ eigenvectors: pcsCleaned, eigenvalues: eigenvalues });
};
