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
    // for each feature j, CPM is the number of reads of j in cell i,
    // divided by total number of reads (over all features) in the cell.
    // multiply this by 10^6 for a nice number
    for (let j = 0; j < nrow; j++) {
      matrix[j][i] = (m[j][i] / colsums[i]) * Math.pow(10, 6);
      matrix[j][i] = Math.log10(matrix[j][i] + 1);
    }
  }

  return matrix;
};

export default cpmNormalize;
