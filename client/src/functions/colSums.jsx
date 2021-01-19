const colSums = (matrix, threshold) => {
  if (!matrix[0]) {
    return {};
  }
  const sums = new Array(100).fill(0);
  const numCells = matrix[0].length;
  const numGenes = matrix.length;
  const badCells = [];

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) {
        geneCount += 1;
      }
    }

    const log = Math.log10(geneCount + 1);
    sums[Math.floor(log * 10)]++;
    // if value is less than the filter threshold, classify the cell as a bad cell
    if (log < threshold) {
      badCells.push(i);
    }
  }

  const obj = [];
  sums.forEach((value, index) => {
    if (value > 0) {
      obj.push({
        range: index / 10,
        frequency: value,
      });
    }
  });
  return { sums: obj, badCells: badCells };
};

export default colSums;
