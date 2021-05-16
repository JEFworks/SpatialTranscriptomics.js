/* eslint-disable */
import mannwhitneyu from "../functions/mannwhitneyu.js";

export const performDGE = (
  clusters,
  filteredMatrix,
  filteredFeatures,
  xNum,
  yNum
) => {
  const dgeSolution = [];

  let maxP = Number.NEGATIVE_INFINITY;
  let maxFC = Number.NEGATIVE_INFINITY;
  let minFC = Number.POSITIVE_INFINITY;

  filteredMatrix.forEach((gene, index) => {
    const geneName = filteredFeatures[index];

    // let's compare between cluster X and cluster Y
    // x = reference group, y = non-reference group
    const clusterX = clusters[xNum - 1];
    const clusterY = clusters[yNum - 1];

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

    const obj = { name: geneName, p: p, fc: fc, type: "neutral" };
    if (fc >= 1 && p >= 1.5) {
      obj.type = "upregulated";
    } else if (fc <= -1 && p >= 1.5) {
      obj.type = "downregulated";
    }

    dgeSolution.push(obj);

    if (isFinite(p) && p > maxP) {
      maxP = p;
    }
    if (isFinite(fc) && fc > maxFC) {
      maxFC = fc;
    }
    if (isFinite(fc) && fc < minFC) {
      minFC = fc;
    }
  });

  for (let i = 0; i < dgeSolution.length; i++) {
    if (dgeSolution[i].p === Number.POSITIVE_INFINITY) {
      dgeSolution[i].capped_p = maxP + 1;
    }
    if (dgeSolution[i].fc === Number.POSITIVE_INFINITY) {
      dgeSolution[i].capped_fc = maxFC + 1;
    } else if (dgeSolution[i].fc === Number.NEGATIVE_INFINITY) {
      dgeSolution[i].capped_fc = minFC - 1;
    }
  }

  self.postMessage({ solution: dgeSolution });
};
