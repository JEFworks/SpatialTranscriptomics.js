library(Matrix)

plotEmbedding <- function(emb, groups=NULL, colors=NULL, cex=0.6, alpha=0.4, gradientPalette=NULL, zlim=NULL,
                          s=1, v=0.8, min.group.size=1, show.legend=FALSE, mark.clusters=FALSE, mark.cluster.cex=2,
                          shuffle.colors=FALSE, legend.x='topright', gradient.range.quantile=0.95, verbose=FALSE,
                          unclassified.cell.color='lightgrey', group.level.colors=NULL, xlab=NA, ylab=NA, ...) {
  
  if(!is.null(colors)) {
    ## use clusters information
    if(!all(rownames(emb) %in% names(colors))) { warning("provided cluster vector doesn't list colors for all of the cells; unmatched cells will be shown in gray. ")}
    if(all(areColors(colors))) {
      if(verbose) cat("using supplied colors as is\n")
      cols <- colors[match(rownames(emb),names(colors))]; cols[is.na(cols)] <- unclassified.cell.color;
      names(cols) <- rownames(emb)
    } else {
      if(is.numeric(colors)) { # treat as a gradient
        if(verbose) cat("treating colors as a gradient")
        if(is.null(gradientPalette)) { # set up default gradients
          if(all(sign(colors)>=0)) {
            gradientPalette <- colorRampPalette(c('grey','red'))(100)
          } else {
            gradientPalette <- colorRampPalette(c("blue", "grey", "red"))(100)
          }
        }
        cols <- map2col(x=colors, pal=gradientPalette, limits=zlim)
        names(cols) <- rownames(emb)
      } else {
        stop("colors argument must be a cell-named vector of either character colors or numeric values to be mapped to a gradient")
      }
    }
  } else {
    if(!is.null(groups)) {
      if(min.group.size>1) { groups[groups %in% levels(groups)[unlist(tapply(groups,groups,length))<min.group.size]] <- NA; groups <- droplevels(groups); }
      groups <- as.factor(groups)[rownames(emb)]
      if(verbose) cat("using provided groups as a factor\n")
      factor.mapping=TRUE;
      ## set up a rainbow color on the factor
      factor.colors <- fac2col(groups,s=s,v=v,shuffle=shuffle.colors,min.group.size=min.group.size,unclassified.cell.color=unclassified.cell.color,level.colors=group.level.colors,return.details=T)
      cols <- factor.colors$colors;
      names(cols) <- rownames(emb)
    } else {
      cols <- rep(unclassified.cell.color, nrow(emb))
      names(cols) <- rownames(emb)
    }
  }
  
  plot(emb,col=adjustcolor(cols,alpha.f=alpha),cex=cex,pch=19,axes=F,xlab=xlab,ylab=ylab, ...); box();
  if(mark.clusters) {
    if(!is.null(groups)) {
      cent.pos <- do.call(rbind,tapply(1:nrow(emb),groups,function(ii) apply(emb[ii,,drop=F],2,median)))
      cent.pos <- na.omit(cent.pos);
      text(cent.pos[,1],cent.pos[,2],labels=rownames(cent.pos),cex=mark.cluster.cex)
    }
  }
  if(show.legend) {
    if(factor.mapping) {
      legend(x=legend.x,pch=rep(19,length(levels(groups))),bty='n',col=factor.colors$palette,legend=names(factor.colors$palette))
    }
  }
}

# Helper function to translate factor into colors
fac2col <- function(x,s=1,v=1,shuffle=FALSE,min.group.size=1,return.details=F,unclassified.cell.color='lightgrey',level.colors=NULL) {
  x <- as.factor(x);
  if(min.group.size>1) {
    x <- factor(x,exclude=levels(x)[unlist(tapply(rep(1,length(x)),x,length))<min.group.size])
    x <- droplevels(x)
  }
  if(is.null(level.colors)) {
    col <- rainbow(length(levels(x)),s=s,v=v);
  } else {
    col <- level.colors[1:length(levels(x))];
  }
  names(col) <- levels(x);
  
  if(shuffle) col <- sample(col);
  
  y <- col[as.integer(x)]; names(y) <- names(x);
  y[is.na(y)] <- unclassified.cell.color;
  if(return.details) {
    return(list(colors=y,palette=col))
  } else {
    return(y);
  }
}
# Quick utility to check if given character vector is colors
# Thanks to Josh O'Brien: http://stackoverflow.com/questions/13289009/check-if-character-string-is-a-valid-color-representation
areColors <- function(x) {
  is.character(x) &
    sapply(x, function(X) {
      tryCatch(is.matrix(col2rgb(X)), error = function(e) FALSE)
    })
}
# Helper function to map values to colors
# Source: https://stackoverflow.com/questions/15006211/how-do-i-generate-a-mapping-from-numbers-to-colors-in-r
map2col <- function(x, pal=colorRampPalette(c('blue', 'grey', 'red'))(100), na.col='lightgrey', limits=NULL){
  original <- x
  x <- na.omit(x)
  if(is.null(limits)) limits=range(x)
  y <- pal[findInterval(x,seq(limits[1],limits[2],length.out=length(pal)+1), all.inside=TRUE)]
  names(y) <- names(x)
  
  colors <- rep(na.col, length(original))
  names(colors) <- names(original)
  colors[names(y)] <- y
  
  return(colors)
}


# dir <- 'filtered_feature_bc_matrix/'
# cd <- readMM(paste0(dir, 'test.mtx.gz'))
# print(cd)
# 
# mat <- as(cd, "dgeMatrix")
# 
# ## center data myself (make mean 0)
# m <- t(mat)
# m <- t(m) - colMeans(m)
# 
# library(RSpectra)
# pca <- RSpectra::svds(
#   A    = t(m),
#   k    = 4,
#   opts = list(
#     center = FALSE, scale = FALSE, maxitr = 2000, tol = 1e-10
#   )
# )


######## read in data
dir <- 'filtered_feature_bc_matrix/filtered/'
cd <- readMM(paste0(dir, 'filtered_matrix.mtx.gz'))

genes <- read.csv(paste0(dir, 'filtered_features.tsv.gz'), sep='\t', header=FALSE)
cells <- read.csv(paste0(dir, 'barcodes.tsv.gz'), sep='\t', header=FALSE)
head(genes)
head(cells)
rownames(cd) <- genes[,2]
colnames(cd) <- cells[,1]
head(cd)

######### QC
dev.off()
par(mfrow=c(2,2))

x= log10(rowSums(cd)+1)
y=log10(colSums(cd>0)+1)
hist(x, breaks=5) ## distribution of cells per gene (log scale)
hist(y, breaks=12) ## distribution of unique gene species per cell ie. library complexity (log scale)

vi <- log10(rowSums(cd) + 1) >= 3.5 ## pick a filtering threshold
cd.filter <- cd[vi,]
vi <- log10(colSums(cd > 0) + 1) >= 1.0 ## pick a filtering threshold
cd.filter <- cd.filter[,vi]

######## Counts per million (CPM) normalization
mat <- Matrix::t(Matrix::t(cd.filter)/Matrix::colSums(cd.filter))
mat <- mat * 1e6
# hist(log10(mat[1,]+1))
# mat <- log10(mat + 1)
dim(mat)

## Principal components dimensionality reduction
## the built in PCA is too slow but feel free to try
# pcs <- prcomp(mat)
## we will instead install a faster implementation
#install.packages("RSpectra")
## center data myself (make mean 0)
m <- t(mat) # cells x genes
m <- t(m) - colMeans(m) # now, m is genes x cells - mean(genes)

library(RSpectra)
pca <- RSpectra::svds(
  A    = t(m), # cells x genes
  k    = 20,
  opts = list(
    center = FALSE, scale = FALSE, maxitr = 2000, tol = 1e-10
  )
)

############# PCA plots
par(mfrow=c(2,2), mar=rep(4,4))

## look at elbow plot to check what is reasonable number of pcs
val <- pca$d
plot(val, type="l")
points(val)
N <- 10
abline(v=N, col='red')
pcs <- pca$u[, 1:N]
rownames(pcs) <- colnames(mat)
colnames(pcs) <- paste0('PC', 1:N)
head(pcs)

plotEmbedding(pcs[,1:2], main='PC1 and PC2')


g <- 'Nptxr'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5
plotEmbedding(pcs[,1:2], main=g, col=gexp,
                     xlab='PC1', ylab='PC2')


############# 2D visualization
## TSNE embedding with regular PCs
## Can also use UMAP (try it out for yourself) using the uwot package
library(Rtsne)
emb.tsne <- Rtsne::Rtsne(pcs,
                    is_distance=FALSE,
                    perplexity=30,
                    max_iter=500,
                    num_threads=1,
                    verbose=FALSE)$Y
rownames(emb.tsne) <- rownames(pcs)
plotEmbedding(emb.tsne, col = gexp, main='tSNE', xlab = "t-SNE X", ylab = "t-SNE Y")


### SPATIAL

g <- 'Nptxr'
gexp <- scale(mat[g,])[,1]
gexp[gexp > 1.5] <- 1.5
gexp[gexp < -1.5] <- -1.5

spotPos <- read.csv("spatial/tissue_positions_list.csv", header=FALSE)
barcodes <- read.csv("filtered_feature_bc_matrix/barcodes.tsv.gz", header=FALSE)
rownames(spotPos) <- spotPos$V1

tissueSpots <- intersect(spotPos[,1], barcodes[,1])
tissueSpotPos <- spotPos[tissueSpots,c("V5", "V6")] # spot IDs and their positions

tissueSpotPosFilt <- tissueSpotPos[colnames(cd.filter),]
tissue_hires_scalef <- 0.17011142
tissueSpotPosFiltAdj <- tissueSpotPosFilt
tissueSpotPosFiltAdj$V5 <- tissueSpotPosFilt$V5 * tissue_hires_scalef
tissueSpotPosFiltAdj$V6 <- tissueSpotPosFilt$V6 * tissue_hires_scalef

tissueSpotRotation <- tissueSpotPosFiltAdj[c("V6", "V5")]
tissueSpotRotation$V5 <- tissueSpotRotation$V5 * -1
plotEmbedding(tissueSpotRotation, col=gexp, 
              cex=1, xlab=NA, ylab=NA,
              verbose=FALSE)

set.seed(0)
cl <- kmeans(pcs, 10)
cl$cluster
col <- rainbow(length(unique(cl$cluster)))[cl$cluster]
names(col) <- names(cl$cluster)

plotEmbedding(emb.tsne, col = col, main='tSNE', xlab = "t-SNE X", ylab = "t-SNE Y")
# par(xpd=TRUE)
legend(legend=c(1:10), col=col, x="topright", lty = 1, lwd = 5, inset=c(-0.35,0))
plotEmbedding(pcs[,1:2], main=g, col=col,xlab='PC1', ylab='PC2')

par(mfrow=c(1,1), mar=rep(4,4))
plotEmbedding(tissueSpotRotation, col=col, 
              cex=1, xlab=NA, ylab=NA,
              verbose=FALSE)
legend(legend=c(1:10), col=col, x="topright", lty = 1, lwd = 5, inset=c(-0.17,0))

