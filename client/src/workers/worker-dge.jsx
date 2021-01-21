/* eslint-disable */
import mannwhitneyu from "../functions/mannwhitneyu.js";

export const performDGE = (
  clusterIndices,
  filteredMatrix,
  filteredFeatures,
  xNum,
  yNum
) => {
  const dgeSolution = [];

  filteredMatrix.forEach((gene, index) => {
    const geneName = filteredFeatures[index];

    // let's compare between cluster X and cluster Y
    // x = reference group, y = non-reference group
    const clusterX =
      clusterIndices[Math.min(xNum - 1, clusterIndices.length - 1)];
    const clusterY =
      clusterIndices[Math.min(yNum - 1, clusterIndices.length - 1)];

    // x will store the reads of this gene in cells of cluster X
    const x = [];
    // y will store the reads of this gene in cells of cluster Y
    const y = [];

    clusterX.forEach((cellIndex) => {
      x.push(gene[cellIndex]);
    });

    clusterY.forEach((cellIndex) => {
      y.push(gene[cellIndex]);
    });

    // perform Wilcox rank sum test
    const result = mannwhitneyu.test(x, y);
    const p = -Math.log10(result.p);

    // compute fold change
    const xReads = x.reduce((a, b) => {
      return a + b;
    }, 0);
    const yReads = y.reduce((a, b) => {
      return a + b;
    }, 0);
    const fc = Math.log2(yReads / xReads);

    dgeSolution.push({ name: geneName, p: p, fc: fc });
  });

  let maxP = Number.NEGATIVE_INFINITY;
  let maxFC = Number.NEGATIVE_INFINITY;
  let minFC = Number.POSITIVE_INFINITY;
  dgeSolution.forEach((gene) => {
    if (isFinite(gene.p) && gene.p > maxP) {
      maxP = gene.p;
    }
    if (isFinite(gene.fc) && gene.fc > maxFC) {
      maxFC = gene.fc;
    }
    if (isFinite(gene.fc) && gene.fc < minFC) {
      minFC = gene.fc;
    }
  });

  for (let i = 0; i < dgeSolution.length; i++) {
    if (dgeSolution[i].p === Number.POSITIVE_INFINITY) {
      dgeSolution[i].p = maxP + 1;
    }

    if (dgeSolution[i].fc === Number.POSITIVE_INFINITY) {
      dgeSolution[i].fc = maxFC + 1;
    } else if (dgeSolution[i].fc === Number.NEGATIVE_INFINITY) {
      dgeSolution[i].fc = minFC - 1;
    }
  }

  self.postMessage({ solution: dgeSolution });
};
