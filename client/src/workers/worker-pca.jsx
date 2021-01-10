import { PCA } from "ml-pca";
import cpmNormalize from "../functions/cpmNormalize.jsx";

export const performPCA = (m) => {
  const matrix = cpmNormalize(m);

  const pca = new PCA(matrix, {
    method: "SVD",
    center: true,
    scale: true,
    ignoreZeroVariance: true,
  });
  const pcs = pca.getEigenvectors().data;
  const eigenvalues = pca.getEigenvalues();

  const pcsCleaned = [];
  pcs.forEach((cell) => {
    pcsCleaned.push([].slice.call(cell));
  });
  self.postMessage({ eigenvectors: pcsCleaned, eigenvalues: eigenvalues });
};
