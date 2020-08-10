## Compare PCA analysis via Javascript and R
library(Matrix)

######## read in data
dir <- '~/Desktop/SpatialTranscriptomics.js/data/coronal_brain/filtered_feature_bc_matrix/filtered/'
cd <- readMM(paste0(dir, 'filtered_matrix.mtx.gz'))
genes <- read.csv(paste0(dir, 'filtered_features.tsv.gz'), sep='\t', header=FALSE)
cells <- read.csv(paste0(dir, 'barcodes.tsv.gz'), sep='\t', header=FALSE)
head(genes)
head(cells)
rownames(cd) <- genes[,2]
colnames(cd) <- cells[,1]
head(cd)

pos.info <- read.csv('~/Desktop/SpatialTranscriptomics.js/data/coronal_brain/spatial/tissue_positions_list.csv.gz', header=FALSE)
head(pos.info)
pos <- pos.info[,5:6]
rownames(pos) <- pos.info[,1]
head(pos)

######## Counts per million (CPM) normalization
mat <- Matrix::t(Matrix::t(cd)/Matrix::colSums(cd))
mat <- mat * 1e6
mat <- log10(mat + 1)
dim(mat)

## center data myself (make mean 0)
m <- t(mat)
m <- t(t(m) - colMeans(m))
colMeans(m) ## double check
## scale data myself (make variance 1)
v <- apply(m, 2, var)
m2 <- t(t(m)/sqrt(v))
apply(m2, 2, var) ## double check
#m2 <- m ## don't scale variance

## regular slow pca
pcs.slow <- prcomp(m2, scale=FALSE, center=FALSE)
names(pcs.slow)
val <- pcs.slow$sdev
plot(val, type="l")
points(val)
N <- 10
abline(v=N, col='red')

## double check that X*V are pcs (https://stats.stackexchange.com/questions/134282/relationship-between-svd-and-pca-how-to-use-svd-to-perform-pca)
loadings <- pcs.slow$rotation
foo <- m2 %*% loadings
head(foo)
head(pcs.slow$x)
plot(foo[,1], pcs.slow$x[,1])

## try rspectra svd
library(RSpectra)
pca <- RSpectra::svds(
  A    = m2,
  k    = 20,
  opts = list(
    center = FALSE, scale = FALSE, maxitr = 2000, tol = 1e-10
  )
)
## look at elbow plot to check what is reasonable number of pcs
val <- pca$d
plot(val, type="l")
points(val)
N <- 10
abline(v=N, col='red')
## X*V
bar <- m2 %*% pca$v
head(bar)
#plot(bar[,1], pca$u[,1]) ## correlated but scaled differently
plot(foo[,1], bar[,1]) ## should be identical

## proceed
pcs <- as.matrix(foo[,1:N])
rownames(pcs) <- colnames(mat)
colnames(pcs) <- paste0('PC', 1:N)
head(pcs)

## TSNE embedding with regular PCs
library(Rtsne)
emb <- Rtsne::Rtsne(pcs,
                    is_distance=FALSE,
                    perplexity=30,
                    num_threads=1,
                    verbose=FALSE)$Y
rownames(emb) <- rownames(pcs)
head(emb)

## visualize gene
g <- 'Nptxr'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5
MUDAN::plotEmbedding(emb, main=g, col=gexp)
MUDAN::plotEmbedding(pcs[,1:2], main=g, col=gexp)

## graph based clustering
knn <- RANN::nn2(pcs, k = 10)[[1]]
adj <- matrix(0, nrow(pcs), nrow(pcs))
rownames(adj) <- colnames(adj) <- rownames(pcs)
invisible(lapply(seq_len(nrow(pcs)), function(i) {
  adj[i, rownames(pcs)[knn[i, ]]] <<- 1
}))
g <- igraph::graph.adjacency(adj, mode = "undirected")
g <- igraph::simplify(g)
com <- igraph::cluster_louvain(g)$membership
names(com) <- rownames(pcs)
table(com)
MUDAN::plotEmbedding(emb, groups=com)
MUDAN::plotEmbedding(pos, groups=com, cex=2)




