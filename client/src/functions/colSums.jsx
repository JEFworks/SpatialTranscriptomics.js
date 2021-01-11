const colSums = (matrix, threshold) => {
  if (!matrix[0]) {
    return {};
  }
  const sums = new Array(20).fill(0);
  const numCells = matrix[0].length;
  const numGenes = matrix.length;
  const badCells = [];

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      geneCount += matrix[j][i];
    }

    const log = Math.log10(geneCount + 1);
    sums[Math.floor(log * 2)]++;
    // if value is less than the filter threshold, classify the cell as a bad cell
    if (log < threshold) {
      badCells.push(i);
    }
  }

  const obj = [];
  sums.forEach((value, index) => {
    obj.push({
      range: index / 2,
      frequency: value,
    });
  });
  return { sums: obj, badCells: badCells };
};

export default colSums;
