/* eslint-disable */
import { SparseMatrix } from "ml-sparse-matrix";

export const getMatrix = (res, features) => {
  const adjustedFeatures = [];
  const m = new SparseMatrix(res.rows, res.columns);
  const elements = m.elements;
  elements.distinct = res.elements.distinct;
  elements.freeEntries = res.elements.freeEntries;
  elements.highWaterMark = res.elements.highWaterMark;
  elements.lowWaterMark = res.elements.lowWaterMark;
  elements.maxLoadFactor = res.elements.maxLoadFactor;
  elements.minLoadFactor = res.elements.minLoadFactor;
  elements.state = res.elements.state;
  elements.table = res.elements.table;
  elements.values = res.elements.values;

  const matrix = m.to2DArray().filter((gene, index) => {
    for (let cell of gene) {
      const feature = features[index];
      if (cell > 0) {
        if (feature) {
          adjustedFeatures.push(feature.toLowerCase());
        }
        return true;
      }
    }
    return false;
  });
  self.postMessage({ matrix: matrix, features: adjustedFeatures });
};
