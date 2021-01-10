const rowSums = (matrix, threshold) => {
  if (!matrix[0]) {
    return {};
  }
  const sums = new Array(20).fill(0);
  const badGenes = [];

  matrix.forEach((gene, index) => {
    const cellCount = gene.reduce((a, b) => {
      return a + b;
    }, 0);

    const log = Math.log10(cellCount + 1);
    sums[Math.floor(log * 2)]++;
    if (log < threshold) {
      badGenes.push(index);
    }
  });

  const obj = [];
  sums.forEach((freq, index) => {
    obj.push({
      range: index / 2,
      frequency: freq,
    });
  });
  return { sums: obj, badGenes: badGenes };
};

export default rowSums;
