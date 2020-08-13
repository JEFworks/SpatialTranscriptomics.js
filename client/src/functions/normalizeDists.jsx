const normalizeDists = (d) => {
  const dists = d.slice();
  let max_dist = 0;
  for (let i = 0; i < dists.length; i++) {
    for (let j = i + 1; j < dists.length; j++) {
      if (dists[i][j] > max_dist) max_dist = dists[i][j];
    }
  }
  for (let i = 0; i < dists.length; i++) {
    for (let j = 0; j < dists.length; j++) {
      dists[i][j] /= max_dist;
    }
  }
  return dists;
};

export default normalizeDists;
