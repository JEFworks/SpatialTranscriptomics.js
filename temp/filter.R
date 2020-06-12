## quick R script to filter down sparse matrix
library(Matrix)

## read in data
dir <- '~/Dropbox (HMS)/Github/SpatialTranscriptomics.js/data/filtered_feature_bc_matrix/'
cd <- readMM(paste0(dir, 'matrix.mtx.gz'))
genes <- read.csv(paste0(dir, 'features.tsv.gz'), sep='\t', header=FALSE)
cells <- read.csv(paste0(dir, 'barcodes.tsv.gz'), sep='\t', header=FALSE)
head(genes)
head(cells)
rownames(cd) <- genes[,2]
colnames(cd) <- cells[,1]
head(cd)

## filter to highly expressed genes 
## non-zero expression in at least 50% of cells (arbitrary)
#vi <- rowSums(cd>0) > ncol(cd)*0.5
#table(vi)
## still a little large

## just manually select genes
vi <- c('Nptxr', 'Agt', 'Ttr', 'Pmch', 'Camk2n1', 'Olfm1', 'Pcp4', 'Prkcd', 'Cck', 'Nnat', 'Plp1', '6330403K07Rik', 'Ctxn1', 'Atp1a1', 'Nrgn', 'Calb2', 'Hpca', 'Fth1', 'Atp1a2', 'Sparc')
cd.filtered <- cd[vi,]
dim(cd.filtered)

writeMM(cd.filtered, file=paste0(dir, '/filtered/filtered_matrix.mtx'))
write.table(rownames(cd.filtered), file=paste0(dir, 'filtered/filtered_features.tsv'), 
          col.names=FALSE, quote=FALSE, sep="\t")
