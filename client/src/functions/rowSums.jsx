const rowSums = (matrix, threshold) => {
  if (!matrix[0]) {
    return {};
  }
  const sums = new Array(100).fill(0);
  const badGenes = [];

  matrix.forEach((gene, index) => {
    const reads = gene.reduce((a, b) => {
      return a + b;
    }, 0);

    const log = Math.log10(reads + 1);
    sums[Math.floor(log * 2)]++;
    // if the value is less than the threshold, classify gene as a bad gene
    if (log < threshold) {
      badGenes.push(index);
    }
  });

  const obj = [];
  sums.forEach((value, index) => {
    if (value > 0) {
      obj.push({
        range: index / 2,
        frequency: value,
      });
    }
  });
  return { sums: obj, badGenes: badGenes };
};

export default rowSums;
