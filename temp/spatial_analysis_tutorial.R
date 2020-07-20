######## Sample spatial transcriptomics analysis
## When working through this analysis, 
## you may think about what parameters 
## you'd be interested in toggling 
## and exploring interactively

library(Matrix)

######## read in data
dir <- '~/Dropbox (HMS)/Github/SpatialTranscriptomics.js/data/coronal_brain/'
cd <- readMM(paste0(dir, 'filtered_feature_bc_matrix/matrix.mtx.gz'))
genes <- read.csv(paste0(dir, 'filtered_feature_bc_matrix/features.tsv.gz'), sep='\t', header=FALSE)
cells <- read.csv(paste0(dir, 'filtered_feature_bc_matrix/barcodes.tsv.gz'), sep='\t', header=FALSE)
head(genes)
head(cells)
rownames(cd) <- genes[,2]
colnames(cd) <- cells[,1]
head(cd)

######## smaller dataset
#library(MERingue)
#data(mOB)
#names(mOB)
#cd <- mOB$counts

######### QC
hist(log10(colSums(cd)+1)) ## distribution of genes per cell ie. library size (log scale) 
hist(log10(colSums(cd>0)+1)) ## distribution of unique gene species per cell ie. library complexity (log scale) 
hist(log10(rowSums(cd)+1)) ## distribution of cells per gene (log scale)
vi <- rowSums(cd) > 1000 ## pick a filtering threshold
table(vi)
cd.filter <- cd[vi,]
vi <- colSums(cd) > 1000 ## pick a filtering threshold
table(vi)
cd.filter <- cd.filter[,vi]
hist(log10(colSums(cd.filter)+1)) 
hist(log10(colSums(cd.filter>0)+1))
hist(log10(rowSums(cd.filter)+1)) 

######## Counts per million (CPM) normalization
mat <- Matrix::t(Matrix::t(cd.filter)/Matrix::colSums(cd.filter))
mat <- mat * 1e6
mat <- log10(mat + 1)
dim(mat)

## Principal components dimensionality reduction
## the built in PCA is too slow but feel free to try
# pcs <- prcomp(mat) 
## we will instead install a faster implementation
# install.packages(RSpectra)
library(RSpectra)
pca <- RSpectra::svds(
  A    = t(mat),
  k    = 50, 
  opts = list(
    center = TRUE, scale = TRUE, maxitr = 2000, tol = 1e-10
  )
)

## look at elbow plot to check what is reasonable number of pcs
val <- pca$d
plot(val, type="l")
N <- 10
abline(v=N, col='red')
pcs <- pca$u[, 1:N]
rownames(pcs) <- colnames(mat)
colnames(pcs) <- paste0('PC', 1:N)
head(pcs)

############# PCA plots
par(mfrow=c(2,2), mar=rep(4,4))
#MUDAN::plotEmbedding(pcs[,1:2], main='PC1 and PC2')

g <- 'Nptxr'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5
MUDAN::plotEmbedding(pcs[,1:2], main=g, col=gexp,
                     xlab='PC1', ylab='PC2')

g <- 'Agt'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5
MUDAN::plotEmbedding(pcs[,1:2], main=g, col=gexp,
                     xlab='PC1', ylab='PC2')

g <- 'Camk2n1'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5
MUDAN::plotEmbedding(pcs[,1:2], main=g, col=gexp,
                     xlab='PC1', ylab='PC2')

g <- 'Pmch'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5
MUDAN::plotEmbedding(pcs[,1:2], main=g, col=gexp,
                     xlab='PC1', ylab='PC2')

############# 2D visualization
## TSNE embedding with regular PCs
## Can also use UMAP (try it out for yourself) using the uwot package
library(Rtsne)
emb <- Rtsne::Rtsne(pcs, 
                    is_distance=FALSE, 
                    perplexity=30, 
                    num_threads=1,
                    verbose=FALSE)$Y 
rownames(emb) <- rownames(pcs)

## Plot
plot(emb, pch=".")
## I'm sure you can visually see transcriptionally distinct clusters
## but let's try to computationally identify them 
## with graph based clustering

## we will first make a k-nearest neighbor graph (with k=30 here)
knn <- RANN::nn2(pcs, k = 30)[[1]]
## we will represent this as an adjacency matrix
adj <- matrix(0, nrow(pcs), nrow(pcs))
rownames(adj) <- colnames(adj) <- rownames(pcs)
invisible(lapply(seq_len(nrow(pcs)), function(i) {
  adj[i, rownames(pcs)[knn[i, ]]] <<- 1
}))
## now we can use this adjacency matrix to build a graph
g <- igraph::graph.adjacency(adj, mode = "undirected")
g <- igraph::simplify(g)
## and now we can run a graph-based community detection method
com <- igraph::cluster_walktrap(g)$membership
names(com) <- rownames(pcs)
table(com)  
## turn into colors
col = rainbow(length(unique(com)))[com]
names(col) <- names(com)

## Now let's plot again
plot(emb, col=col, pch=".")  
  
## You can also visualize these clusters in different embeddings like in PC space
## first 2 PCs for example
plot(pcs[,1:2], col=col, pch=".")  

## Since this is spatial data, we can also see where these 
## transcriptional clusters are spatially
positions <- read.csv(paste0(dir, 'spatial/tissue_positions_list.csv.gz'),
                header=FALSE)
head(positions)
## we only care about the x-y pixel coordinates for now
pos <- positions[,c(5,6)]
rownames(pos) <- positions[,1]
#head(pos)
#pos <- mOB$pos
## plot (note positions may be in different order to gene expression matrix)
plot(pos[names(col),], col=col, pch=16)  

######## Output data
#library(Matrix)
#dir <- '~/Dropbox (HMS)/Github/SpatialTranscriptomics.js/data/olfactory_bulb/'
#writeMM(obj = Matrix(cd, sparse=TRUE), file = paste0(dir, 'filtered_feature_bc_matrix/matrix.mtx'))
#write.table(rownames(cd), paste0(dir, 'filtered_feature_bc_matrix/features.tsv'), sep='\t', quote=FALSE, col.names=FALSE)
#write.table(colnames(cd), paste0(dir, 'filtered_feature_bc_matrix/barcodes.tsv'), sep='\t', quote=FALSE, col.names=FALSE)
#write.table(pos, paste0(dir, 'spatial/tissue_positions_list.csv'), sep='\t', quote=FALSE, col.names=FALSE)

