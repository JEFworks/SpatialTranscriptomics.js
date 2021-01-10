const getFilteredData = (matrix, features, barcodes, badGenes, badCells) => {
  const filteredFeatures = [];
  const filteredBarcodes = [];

  // rowsum filtering
  const filteredMatrix = matrix.filter((_gene, index) => {
    const badGene = badGenes.includes(index);
    if (features.length > 0 && !badGene) {
      filteredFeatures.push(features[index]);
    }
    return !badGene;
  });

  // colsum filtering
  filteredMatrix.forEach((gene, index) => {
    const filteredGene = gene.filter((_cell, i) => {
      const badCell = badCells.includes(i);
      if (barcodes.length > 0 && index === 0 && !badCell) {
        filteredBarcodes.push(barcodes[i]);
      }
      return !badCell;
    });

    filteredMatrix[index] = filteredGene;
  });

  return {
    matrix: filteredMatrix,
    features: filteredFeatures,
    barcodes: filteredBarcodes,
  };
};

export default getFilteredData;
