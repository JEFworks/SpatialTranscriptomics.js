/* eslint-disable */
import rowSums from "../functions/rowSums.jsx";
import colSums from "../functions/colSums.jsx";
import getFilteredData from "../functions/getFilteredData.jsx";

export const filter = (
  matrix,
  thresholds,
  barcodes,
  adjustedFeatures,
  rowsums,
  colsums,
  minRowSum,
  minColSum
) => {
  if (minRowSum !== null) {
    thresholds.minRowSum = minRowSum;
    rowsums = rowSums(matrix, thresholds.minRowSum);
  }
  if (minColSum !== null) {
    thresholds.minColSum = minColSum;
    colsums = colSums(matrix, thresholds.minColSum);
  }

  const filteredData = getFilteredData(
    matrix,
    adjustedFeatures,
    barcodes,
    rowsums.badGenes,
    colsums.badCells
  );

  self.postMessage({
    filteredData: filteredData,
    rowsums: rowsums,
    colsums: colsums,
  });
};
