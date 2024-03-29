/* eslint-disable */
import MHG from "../functions/mhg.js";

// compute intersection of sets A and B
const intersect = (a, b) => {
  if (a.length > b.length) {
    return a.filter((e) => b.includes(e));
  }
  return b.filter((e) => a.includes(e));
};

export const performGSE = (geneSets, dgeSolution) => {
  // the genes we have are the differentially expressed genes
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
    const setID = sets[i][0]; // GO term
    const setList = sets[i][1]; // actual list of genes for this GO term

    const geneSet = intersect(setList, genesHave);
    const N = genesHave.length;
    const K = geneSet.length;
    const L = N;
    const X = 1;

    // gene set should contain >= 2 genes from the genes we have
    // otherwise, skip
    if (K < 2) {
      continue;
    }

    // compute binary vector and do MHG
    const v = genesHave.map((name) => (geneSet.includes(name) ? 1 : 0));
    const res = MHG.mhg_test(v, N, K, L, X, genesHave);
    // res object is
    // { threshold (index of most enriched gene),
    //   mhg (array of enrichment scores for each gene),
    //   pvalue
    // }

    // no enrichment, skip
    if (res.mhg[0] == null) {
      continue;
    }

    // save the gene set in the res object
    res.geneSet = geneSet;
    results.set(setID, res);
  }

  // GSE results is a map of (key: set ID, value: {threshold, pvalue, mhg, geneSet})
  // now, sort GSE results by p-value
  const sortedResults = new Map(
    [...results.entries()]
      .sort((a, b) => a[1].pvalue - b[1].pvalue)
      .slice(0, 50)
  );
  const gseSolution = { Genes: genesHave, GSE: sortedResults };

  self.postMessage({ solution: gseSolution });
};
