export const pathways = {
  iis: { name: "IIS / longevity", shortName: "IIS", description: "Insulin/IGF-like control of development, stress resistance, and longevity", color: "#b9d66a", reference: "wormbook-iis" },
  autophagy: { name: "Autophagy", shortName: "Autophagy", description: "Initiation, membrane expansion, cargo capture, and lysosomal turnover", color: "#83d6ad", reference: "wormbook-autophagy" },
  ras: { name: "Ras / MAPK", shortName: "Ras/MAPK", description: "Receptor-to-ERK signaling and developmental cell-fate control", color: "#82b9c8", reference: "wormbook-ras" },
  apoptosis: { name: "Apoptosis", shortName: "Apoptosis", description: "Canonical developmental programmed cell death", color: "#f19878", reference: "wormbook-apoptosis" },
  tor: { name: "TOR / AMPK", shortName: "TOR/AMPK", description: "Nutrient and energy sensing", color: "#d6b66a", reference: "wormbook-translation" },
  uprer: { name: "ER stress / UPRER", shortName: "UPRER", description: "Endoplasmic-reticulum proteostasis signaling", color: "#a6a6e8", reference: "wormbook-translation" },
  uprmt: { name: "Mitochondrial stress / UPRmt", shortName: "UPRmt", description: "Mitochondrial-to-nuclear stress communication", color: "#d595c8", reference: "uprmt-review" },
  proteostasis: { name: "Proteostasis / proteasome", shortName: "Proteostasis", description: "Protein quality control and proteasomal degradation", color: "#9ec9a4", reference: "proteasome-review" },
  rnai: { name: "RNA interference", shortName: "RNAi", description: "Trigger uptake, siRNA production, and Argonaute-mediated silencing", color: "#7ec5d4", reference: "wormbook-rnai" },
  dna: { name: "DNA damage", shortName: "DNA damage", description: "Checkpoint signaling, recombination, and genome integrity", color: "#e7aa7c", reference: "dna-review" },
  cellcycle: { name: "Cell cycle", shortName: "Cell cycle", description: "Cyclin–CDK control of division and arrest", color: "#b7a7e0", reference: "wormbook-celldivision" },
  wnt: { name: "Wnt signaling", shortName: "Wnt", description: "Cell polarity and cell-fate transcription", color: "#86c6a2", reference: "wormbook-wnt" },
  notch: { name: "Notch signaling", shortName: "Notch", description: "Contact-dependent binary cell-fate decisions", color: "#c4b97b", reference: "wormbook-notch" },
  tgf: { name: "DAF-7 / TGF-beta", shortName: "TGF-beta", description: "Environmental regulation of dauer development", color: "#9abbe5", reference: "wormbook-tgf" },
  immunity: { name: "Innate immunity", shortName: "Innate immunity", description: "Pathogen-responsive MAPK and transcriptional defenses", color: "#e28e87", reference: "wormbook-immunity" }
};

export const pathwayDiagrams = {
  iis: [
    { label: "DAF-2", relation: "activates" }, { label: "AGE-1 / PI3K", relation: "activates" },
    { label: "PDK-1 / AKT", relation: "inhibits" }, { label: "DAF-16 / FOXO" }
  ],
  ras: [
    { label: "LET-23", relation: "activates" }, { label: "SEM-5 / SOS-1", relation: "activates" },
    { label: "LET-60", relation: "activates" }, { label: "LIN-45", relation: "activates" },
    { label: "MEK-2", relation: "activates" }, { label: "MPK-1" }
  ],
  apoptosis: [
    { label: "EGL-1", relation: "inhibits" }, { label: "CED-9", relation: "inhibits" },
    { label: "CED-4", relation: "activates" }, { label: "CED-3" }
  ],
  immunity: [
    { label: "NSY-1", relation: "activates" }, { label: "SEK-1", relation: "activates" },
    { label: "PMK-1", relation: "modulates" }, { label: "ATF-7" }
  ]
};

export const references = {
  "wormbook-iis": { title: "Insulin/insulin-like growth factor signaling in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK179230/" },
  "wormbook-autophagy": { title: "Autophagy in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK116074/" },
  "autophagy-development": { title: "Autophagy in C. elegans development", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6204124/" },
  "wormbook-ras": { title: "Canonical RTK–Ras–ERK signaling and related pathways", url: "https://www.ncbi.nlm.nih.gov/books/NBK19739/" },
  "sos1-primary": { title: "C. elegans SOS-1 is necessary for multiple RAS-mediated developmental signals", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC313952/" },
  "wormbook-apoptosis": { title: "Programmed cell death", url: "https://www.ncbi.nlm.nih.gov/books/NBK19668/" },
  "wormbook-translation": { title: "Mechanism and regulation of translation in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK19664/" },
  "uprmt-review": { title: "The mitochondrial unfolded protein response", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3867496/" },
  "proteasome-review": { title: "Proteasome system resources at WormBase", url: "https://wormbase.org/" },
  "wormbook-rnai": { title: "Endogenous RNAi pathways in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK206718/" },
  "dna-review": { title: "DNA damage responses in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK19731/" },
  "wormbook-celldivision": { title: "Cell division", url: "https://www.ncbi.nlm.nih.gov/books/NBK19681/" },
  "wormbook-wnt": { title: "Wnt signaling in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK19669/" },
  "wormbook-notch": { title: "Notch signaling: genetics and structure", url: "https://www.ncbi.nlm.nih.gov/books/NBK19703/" },
  "wormbook-tgf": { title: "TGF-beta signaling in C. elegans", url: "https://www.ncbi.nlm.nih.gov/books/NBK19692/" },
  "wormbook-immunity": { title: "Signaling in the innate immune response", url: "https://www.ncbi.nlm.nih.gov/books/NBK19673/" }
};
