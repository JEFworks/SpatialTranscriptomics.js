/* eslint-disable */
import { KMeans } from "machinelearn/cluster";
import palette from "../functions/palette.jsx";

const kmeansAlgo = (pcs, num) => {
  const kmean = new KMeans({ k: num });
  if (pcs[0]) {
    kmean.fit(pcs);
    const clusters = kmean.toJSON().clusters;
    return clusters;
  }
  return null;
};

export const performKMeans = (pcs, num) => {
  const clusters = kmeansAlgo(pcs, num);

  const hashmap = new Map();
  pcs.forEach((cell, index) => {
    hashmap.set(cell, index);
  });

  const colorsMap = new Map();
  let i = 0;
  if (clusters != null) {
    clusters.forEach((cluster) => {
      cluster.forEach((cell) => {
        const index = hashmap.get(cell);
        colorsMap.set(index, palette[i % palette.length]);
      });
      i++;
    });
  }

  const sorted = new Map(
    [...colorsMap].sort((a, b) => parseInt(a) - parseInt(b))
  );
  const colors = [...sorted.values()];

  self.postMessage({ colors: colors });
};
