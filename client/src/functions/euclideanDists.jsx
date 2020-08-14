const euclideanDists = (matrix) => {
  const dists = new Array(Math.min(1000, matrix.length));
  for (let i = 0; i < dists.length; i++)
    dists[i] = new Array(dists.length).fill(0);

  for (let i = 0; i < dists.length; i++) {
    for (let j = i + 1; j < dists.length; j++) {
      for (let d = 0; d < matrix[0].length; d++) {
        dists[i][j] += Math.pow(matrix[i][d] - matrix[j][d], 2);
      }
      dists[i][j] = Math.sqrt(dists[i][j]);
      dists[j][i] = dists[i][j];
    }
  }

  return dists;
};

export default euclideanDists;
