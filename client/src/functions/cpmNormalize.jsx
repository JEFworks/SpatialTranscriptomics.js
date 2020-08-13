const cpmNormalize = (m) => {
  const matrix = m.slice();
  matrix.forEach((gene, index) => {
    const totalReads = gene.reduce((a, b) => {
      return a + b;
    }, 0);
    matrix[index] = gene.map((cell) => {
      const cpm = (cell * Math.pow(10, 6)) / totalReads;
      return Math.log10(cpm + 1);
    });
  });
  return matrix;
};

export default cpmNormalize;
