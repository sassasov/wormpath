export const learningPortals = [
  { name: "WormBase", kind: "Gene records", description: "Curated gene descriptions, alleles, phenotypes, expression, interactions, and references.", url: "https://wormbase.org/" },
  { name: "WormAtlas", kind: "Anatomy & images", description: "Verified anatomical plates, tissue descriptions, cell identities, and ultrastructure.", url: "https://www.wormatlas.org/" },
  { name: "Alliance of Genome Resources", kind: "Orthology", description: "Cross-species gene, disease, function, and orthology information.", url: "https://www.alliancegenome.org/" },
  { name: "WormBook", kind: "Review articles", description: "Expert chapters covering C. elegans pathways, cell biology, anatomy, genetics, and methods.", url: "https://www.ncbi.nlm.nih.gov/books/NBK19662/" }
];

export const learningCollections = [
  { title: "Signals to the nucleus", description: "Follow extracellular and metabolic cues through receptors, kinases, and regulated transcription factors.", pathwayIds: ["iis", "ras", "notch", "daf7", "bmp", "wnt"] },
  { title: "Proteostasis across organelles", description: "Compare ER, mitochondrial, lysosomal, autophagic, and proteasomal quality-control systems.", pathwayIds: ["uprer", "erad", "uprmt", "autophagy", "lysosome", "proteasome"] },
  { title: "Membranes and cargo routes", description: "Trace proteins and receptors through ER export, Golgi sorting, endocytosis, recycling, MVBs, and lysosomes.", pathwayIds: ["secretoryTraffic", "endocytosis", "escrt", "autophagy"] },
  { title: "Genome and cell division", description: "Connect damage sensing, repair, chromatin, centrosomes, kinetochores, checkpoints, and chromosome segregation.", pathwayIds: ["dnaCheckpoint", "homologousRecombination", "nhej", "mismatchRepair", "centrosome", "kinetochore", "spindleCheckpoint"] },
  { title: "Neurons, cilia, and behavior", description: "Distinguish sensory organelles, channel systems, axon guidance, transmitter identity, and vesicle release.", pathwayIds: ["cilium", "chemosensation", "mechanosensation", "axonGuidance", "neurotransmission", "synapticVesicle"] },
  { title: "Development in real cells", description: "Place classic pathways into embryo, germ line, seam cells, vulval precursors, anchor cell, and muscle.", pathwayIds: ["polarity", "germlineStemCells", "heterochronic", "sexDetermination", "muscle", "cellAtlas"] }
];

export const featuredLearningPathways = [
  "iis", "autophagy", "uprer", "uprmt", "ras", "apoptosis", "hypoxia", "endocytosis",
  "secretoryTraffic", "germlineStemCells", "cilium", "synapticVesicle", "respiration", "proteasome",
  "homologousRecombination", "spindleCheckpoint", "polarity", "peroxisome"
];
