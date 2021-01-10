import euclideanDists from "../functions/euclideanDists.jsx";
import normalizeDists from "../functions/normalizeDists.jsx";
import tsnejs from "../functions/tsne.js";

export const performTSNE = (filteredPCs, opt, iterations) => {
  const dists = normalizeDists(euclideanDists(filteredPCs));
  const tsne = new tsnejs.tSNE(opt); // create a tSNE instance
  tsne.initDataDist(dists);

  for (let k = 0; k < iterations; k++) {
    tsne.step(); // default 500 iterations
  }
  const Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
  self.postMessage({ solution: Y });
};
