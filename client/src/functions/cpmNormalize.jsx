const cpmNormalize = (m) => {
  const nrow = m.length;
  const ncol = m[0].length;

  const matrix = new Array(nrow);
  for (let i = 0; i < nrow; i++) {
    matrix[i] = new Array(ncol);
  }

  const colsums = [];
  for (let i = 0; i < ncol; i++) {
    let geneCount = 0;
    for (let j = 0; j < nrow; j++) {
      geneCount += m[j][i];
    }
    colsums.push(geneCount);
  }

  for (let i = 0; i < ncol; i++) {
    for (let j = 0; j < nrow; j++) {
      matrix[j][i] = m[j][i] / colsums[i];
      matrix[j][i] *= Math.pow(10, 6);
    }
  }

  return matrix;
};

export default cpmNormalize;
