/* eslint-disable */
import { KMeans } from "machinelearn/cluster";
import getPalette from "../functions/palette.jsx";

const kmeansAlgo = (pcs, k) => {
  const kmean = new KMeans({ k: k });
  if (pcs[0]) {
    kmean.fit(pcs);
    const { clusters } = kmean.toJSON();
    return clusters;
  }
  return null;
};

export const performKMeans = (pcs, k) => {
  const clusters = kmeansAlgo(pcs, k);
  const palette = getPalette(k);

  const cellsMap = new Map();
  pcs.forEach((cell, index) => {
    // keep a record of the cell's indices (e.g. first cell has index 1, second cell has index 2, ...)
    cellsMap.set(cell, index);
  });

  const clusterIndices = [];

  // produce coloring
  const colorsMap = new Map();
  let i = 0;
  if (clusters) {
    clusters.forEach((cluster) => {
      const indices = [];
      cluster.forEach((cell) => {
        // get the index of this cell and give the cell the color of this cluster
        const index = cellsMap.get(cell);
        colorsMap.set(index, palette[i]);
        indices.push(index);
      });
      clusterIndices.push(indices);
      i++;
    });
  }

  // sort the map so colors[i] is the color of cells[i]
  const sortedColorsMap = new Map(
    [...colorsMap].sort((a, b) => parseInt(a) - parseInt(b))
  );
  const colors = [...sortedColorsMap.values()];

  self.postMessage({ colors: colors, clusters: clusterIndices });
};
