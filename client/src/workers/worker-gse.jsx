/* eslint-disable */
import MHG from "../functions/mhg.js";

// helper function for GSEA
const intersect = (a, b) => {
  if (a.length > b.length) {
    return a.filter((e) => b.includes(e));
  }
  return b.filter((e) => a.includes(e));
};

export const performGSE = (geneSets, dgeSolution) => {
  // the genes we have are the DE genes
  const genesHave = [];
  dgeSolution.forEach((gene) => {
    const { name, type } = gene;
    if (type === "upregulated" || type === "downregulated") {
      genesHave.push(name);
    }
  });

  const sets = Object.entries(geneSets);
  const results = new Map();

  for (let i = 0; i < sets.length; i++) {
    const setID = sets[i][0];
    const setList = sets[i][1];

    const geneSet = intersect(setList, genesHave);
    const N = genesHave.length;
    const K = geneSet.length;
    const L = N;
    const X = 1;

    // geneset should contain >= 2 genes from the genes we have
    // otherwise, skip
    if (K < 2) {
      continue;
    }

    const v = genesHave.map((name) => (geneSet.includes(name) ? 1 : 0));
    const res = MHG.mhg_test(v, N, K, L, X);

    // no enrichment, skip
    if (res.mhg[0] == null) {
      continue;
    }

    res.geneSet = geneSet;
    results.set(setID, res);
  }

  const sortedResults = new Map(
    [...results.entries()].sort((a, b) => a[1].pvalue - b[1].pvalue)
  );
  const gseSolution = { Genes: genesHave, GSE: sortedResults };

  self.postMessage({ solution: gseSolution });
};
