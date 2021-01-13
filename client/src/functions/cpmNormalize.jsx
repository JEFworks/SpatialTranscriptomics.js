const cpmNormalize = (m) => {
  const matrix = m.slice();

  const colsums = [];
  for (let i = 0; i < matrix[0].length; i++) {
    let geneCount = 0;
    for (let j = 0; j < matrix.length; j++) {
      geneCount += matrix[j][i];
    }
    colsums.push(geneCount);
  }

  for (let i = 0; i < matrix[0].length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      matrix[j][i] /= colsums[i];
      matrix[j][i] *= Math.pow(10, 6);
    }
  }

  return matrix;
};

export default cpmNormalize;
