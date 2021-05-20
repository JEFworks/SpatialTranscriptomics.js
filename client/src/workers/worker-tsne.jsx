/* eslint-disable */
import euclideanDists from "../functions/euclideanDists.jsx";
import normalizeDists from "../functions/normalizeDists.jsx";
import tsnejs from "../functions/tsne.js";

/* Code adapted from JEFworks/tsne-online */
export const performTSNE = (filteredPCs, opt, iterations) => {
  const dists = normalizeDists(euclideanDists(filteredPCs));
  const tsne = new tsnejs.tSNE(opt); // create a tSNE instance
  tsne.initDataDist(dists);

  for (let k = 0; k < iterations; k++) {
    tsne.step(); // default 500 iterations
  }
  const Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot

  // make 2D embedding
  const embedding = [];
  Y.forEach((point, index) => {
    const x = point[0] * 7 + 450;
    const y = point[1] * 7 + 300;
    embedding.push({ x: x, y: y, index: index });
  });

  self.postMessage({ solution: embedding });
};
