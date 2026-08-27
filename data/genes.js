import { expandedGeneConfigs } from "./expandedGenes.js";

const gene = ({
  gene: name,
  pathway,
  pathways: pathwayList,
  molecularFunction,
  biologicalProcesses,
  difficulty,
  explanation,
  aliases = [],
  localization = [],
  organelles = [],
  tissues = [],
  cellTypes = [],
  localizationStates = [],
  reporterContexts = [],
  expressionScope = "not assigned",
  recognitionSafe = true,
  upstreamRegulators = [],
  downstreamTargets = [],
  interactionType = "participates in",
  phenotypes = [],
  orthologs = [],
  references = []
}) => ({
  gene: name,
  aliases,
  pathway,
  pathways: pathwayList || [pathway],
  molecularFunction,
  biologicalProcesses,
  cellularLocalization: localization,
  organelles: organelles.map((organelle) => typeof organelle === "string" ? { organelle, confidence: "established" } : organelle),
  tissues,
  cellTypes,
  localizationStates,
  reporterContexts,
  expressionScope,
  recognitionSafe,
  upstreamRegulators,
  downstreamTargets,
  interactionType,
  phenotypes,
  orthologs,
  difficulty,
  explanation: explanation || `${name} contributes to ${biologicalProcesses[0]} as ${molecularFunction}.`,
  references
});

const coreGenes = [
  // Insulin/IGF-like signaling and longevity
  gene({ gene: "daf-2", pathway: "iis", molecularFunction: "the sole insulin/IGF-1-like receptor tyrosine kinase", biologicalProcesses: ["insulin-like signaling", "dauer choice", "longevity"], localization: ["plasma membrane"], downstreamTargets: ["age-1"], interactionType: "activates", phenotypes: ["reduced signaling can extend adult lifespan and promote dauer entry"], orthologs: ["INSR", "IGF1R"], difficulty: 2, explanation: "DAF-2 activates the canonical PI3K–PDK–AKT branch that restrains DAF-16/FOXO.", references: ["wormbook-iis"] }),
  gene({ gene: "age-1", aliases: ["daf-23"], pathway: "iis", molecularFunction: "the catalytic subunit of class I phosphoinositide 3-kinase", biologicalProcesses: ["PIP3 production", "dauer choice", "longevity"], localization: ["cytoplasmic face of membranes"], upstreamRegulators: ["daf-2"], downstreamTargets: ["pdk-1"], interactionType: "activates", orthologs: ["PIK3CA"], difficulty: 2, explanation: "AGE-1 produces the lipid signal that recruits and activates downstream IIS kinases.", references: ["wormbook-iis"] }),
  gene({ gene: "pdk-1", pathway: "iis", molecularFunction: "a phosphoinositide-dependent protein kinase", biologicalProcesses: ["AKT activation", "dauer regulation"], upstreamRegulators: ["age-1"], downstreamTargets: ["akt-1", "akt-2", "sgk-1"], interactionType: "phosphorylates", orthologs: ["PDPK1"], difficulty: 3, explanation: "PDK-1 relays the AGE-1-generated membrane signal to AGC-family kinases.", references: ["wormbook-iis"] }),
  gene({ gene: "akt-1", pathway: "iis", molecularFunction: "an AKT-family serine/threonine kinase", biologicalProcesses: ["DAF-16 regulation", "dauer inhibition"], upstreamRegulators: ["pdk-1"], downstreamTargets: ["daf-16"], interactionType: "phosphorylates and inhibits", orthologs: ["AKT1", "AKT2", "AKT3"], difficulty: 2, explanation: "AKT-1 phosphorylation favors cytoplasmic retention of DAF-16.", references: ["wormbook-iis"] }),
  gene({ gene: "akt-2", pathway: "iis", molecularFunction: "an AKT-family serine/threonine kinase partially redundant with AKT-1", biologicalProcesses: ["DAF-16 regulation", "dauer inhibition"], upstreamRegulators: ["pdk-1"], downstreamTargets: ["daf-16"], interactionType: "phosphorylates and inhibits", orthologs: ["AKT1", "AKT2", "AKT3"], difficulty: 3, explanation: "AKT-2 cooperates with AKT-1 in canonical insulin-like signaling.", references: ["wormbook-iis"] }),
  gene({ gene: "sgk-1", pathway: "iis", molecularFunction: "an SGK-family serine/threonine kinase", biologicalProcesses: ["stress physiology", "developmental and longevity regulation"], upstreamRegulators: ["pdk-1"], downstreamTargets: ["daf-16"], interactionType: "modulates", orthologs: ["SGK1"], difficulty: 4, explanation: "SGK-1 is an AGC kinase in the IIS network with context-dependent effects on DAF-16 and longevity.", references: ["wormbook-iis"] }),
  gene({ gene: "daf-16", pathway: "iis", molecularFunction: "a FOXO-family transcription factor", biologicalProcesses: ["stress-resistance transcription", "dauer development", "longevity"], localization: ["nucleus when IIS is reduced", "cytoplasm when strongly phosphorylated by IIS kinases"], upstreamRegulators: ["akt-1", "akt-2", "sgk-1"], interactionType: "transcriptionally activates", orthologs: ["FOXO1", "FOXO3", "FOXO4", "FOXO6"], difficulty: 2, explanation: "Reduced IIS promotes DAF-16 nuclear accumulation and a broad protective transcriptional program.", references: ["wormbook-iis"] }),
  gene({ gene: "daf-18", pathway: "iis", molecularFunction: "a PTEN-family PIP3 lipid phosphatase", biologicalProcesses: ["antagonism of PI3K signaling", "dauer regulation"], upstreamRegulators: [], downstreamTargets: ["age-1 pathway output"], interactionType: "inhibits", orthologs: ["PTEN"], difficulty: 3, explanation: "DAF-18 removes the AGE-1-generated lipid signal and thereby opposes canonical IIS.", references: ["wormbook-iis"] }),

  // Autophagy
  gene({ gene: "unc-51", pathway: "autophagy", molecularFunction: "an Atg1/ULK-family kinase in the autophagy initiation complex", biologicalProcesses: ["autophagy initiation", "axon development"], upstreamRegulators: ["let-363 nutrient signaling"], downstreamTargets: ["atg-13"], interactionType: "forms an initiation complex with", orthologs: ["ULK1", "ULK2"], difficulty: 3, explanation: "UNC-51 has both autophagy and neuronal trafficking functions, so an Unc phenotype is not by itself an autophagy-specific readout.", references: ["wormbook-autophagy"] }),
  gene({ gene: "atg-13", pathway: "autophagy", molecularFunction: "a regulatory component of the UNC-51/Atg1 initiation complex", biologicalProcesses: ["autophagy initiation"], upstreamRegulators: ["let-363", "unc-51"], interactionType: "binds", orthologs: ["ATG13"], difficulty: 3, explanation: "ATG-13 helps organize the upstream kinase complex that initiates autophagosome biogenesis.", references: ["autophagy-development"] }),
  gene({ gene: "bec-1", pathway: "autophagy", molecularFunction: "a Beclin 1/Atg6 ortholog in the class III PI3K nucleation complex", biologicalProcesses: ["phagophore nucleation", "membrane trafficking"], downstreamTargets: ["let-512"], interactionType: "forms a complex with", orthologs: ["BECN1"], difficulty: 2, explanation: "BEC-1 participates in autophagic membrane nucleation and also has broader endolysosomal roles.", references: ["wormbook-autophagy"] }),
  gene({ gene: "let-512", aliases: ["vps-34"], pathway: "autophagy", molecularFunction: "the class III phosphatidylinositol 3-kinase VPS34", biologicalProcesses: ["PI3P production", "phagophore nucleation", "endosomal trafficking"], upstreamRegulators: ["bec-1"], downstreamTargets: ["atg-18"], interactionType: "produces PI3P to recruit", orthologs: ["PIK3C3"], difficulty: 4, explanation: "LET-512/VPS34 generates PI3P used by autophagic and endosomal membrane machinery.", references: ["autophagy-development"] }),
  gene({ gene: "atg-9", pathway: "autophagy", molecularFunction: "a multipass transmembrane autophagy protein that supplies membrane to the forming phagophore", biologicalProcesses: ["autophagosome membrane delivery"], localization: ["cycling vesicles", "phagophore-associated membranes"], interactionType: "delivers membrane", orthologs: ["ATG9A", "ATG9B"], difficulty: 3, explanation: "ATG-9 is the core transmembrane ATG protein and cycles membrane to autophagosome assembly sites.", references: ["autophagy-development"] }),
  gene({ gene: "atg-18", aliases: ["epg-6"], pathway: "autophagy", molecularFunction: "a PI3P-binding WIPI-family autophagy protein", biologicalProcesses: ["phagophore expansion", "autophagic membrane organization"], upstreamRegulators: ["let-512"], interactionType: "binds PI3P", orthologs: ["WIPI1", "WIPI2"], difficulty: 3, explanation: "ATG-18 is recruited to PI3P-rich autophagic membranes downstream of the nucleation complex.", references: ["autophagy-development"] }),
  gene({ gene: "atg-7", pathway: "autophagy", molecularFunction: "an E1-like enzyme for autophagy conjugation systems", biologicalProcesses: ["ATG8/LGG lipidation", "autophagosome expansion"], downstreamTargets: ["atg-3", "lgg-1"], interactionType: "activates conjugation enzymes", orthologs: ["ATG7"], difficulty: 3, explanation: "ATG-7 activates ubiquitin-like ATG proteins during autophagosome growth.", references: ["wormbook-autophagy"] }),
  gene({ gene: "atg-3", pathway: "autophagy", molecularFunction: "an E2-like enzyme for LGG/Atg8 lipid conjugation", biologicalProcesses: ["LGG lipidation", "autophagosome expansion"], upstreamRegulators: ["atg-7"], downstreamTargets: ["lgg-1", "lgg-2"], interactionType: "conjugates", orthologs: ["ATG3"], difficulty: 3, explanation: "ATG-3 transfers activated LGG proteins to phosphatidylethanolamine on autophagic membranes.", references: ["autophagy-development"] }),
  gene({ gene: "atg-5", pathway: "autophagy", molecularFunction: "a component of the Atg12–Atg5–Atg16 conjugation complex", biologicalProcesses: ["autophagosome expansion", "LGG lipidation"], upstreamRegulators: ["atg-7"], downstreamTargets: ["atg-16.2"], interactionType: "forms a conjugate complex", orthologs: ["ATG5"], difficulty: 3, explanation: "ATG-5 is part of an E3-like complex that promotes spatially restricted LGG lipidation.", references: ["autophagy-development"] }),
  gene({ gene: "atg-16.2", pathway: "autophagy", molecularFunction: "an Atg16-family scaffold in the Atg12–Atg5 complex", biologicalProcesses: ["phagophore expansion", "site selection for LGG lipidation"], upstreamRegulators: ["atg-5"], interactionType: "scaffolds", orthologs: ["ATG16L1", "ATG16L2"], difficulty: 4, explanation: "ATG-16.2 helps target the conjugation machinery to growing autophagic membranes.", references: ["autophagy-development"] }),
  gene({ gene: "lgg-1", pathway: "autophagy", molecularFunction: "an Atg8/GABARAP-family ubiquitin-like autophagy protein", biologicalProcesses: ["autophagosome biogenesis", "cargo recruitment"], localization: ["cytosol", "lipidated on autophagic membranes"], upstreamRegulators: ["atg-7", "atg-3"], interactionType: "is lipidated and recruits", orthologs: ["GABARAP family", "LC3 family"], difficulty: 2, explanation: "LGG-1 puncta report autophagic structures, but puncta number alone does not measure flux.", references: ["wormbook-autophagy"] }),
  gene({ gene: "lgg-2", pathway: "autophagy", molecularFunction: "a second Atg8-family protein with functions partly distinct from LGG-1", biologicalProcesses: ["autophagosome maturation", "selective autophagy"], upstreamRegulators: ["atg-7", "atg-3"], interactionType: "is lipidated", orthologs: ["LC3 family"], difficulty: 4, explanation: "LGG-2 is not simply interchangeable with LGG-1; the two Atg8 paralogs can mark different autophagic steps or contexts.", references: ["autophagy-development"] }),
  gene({ gene: "sqst-1", pathway: "autophagy", molecularFunction: "a selective-autophagy cargo receptor related to p62/SQSTM1", biologicalProcesses: ["ubiquitinated cargo delivery", "proteostasis"], downstreamTargets: ["lgg-1"], interactionType: "binds cargo and Atg8-family proteins", orthologs: ["SQSTM1"], difficulty: 3, explanation: "SQST-1 links selected cargo to autophagic membranes and can accumulate when clearance is impaired.", references: ["autophagy-development"] }),

  // RTK/Ras/ERK
  gene({ gene: "let-23", pathway: "ras", molecularFunction: "an epidermal growth factor receptor-like receptor tyrosine kinase", biologicalProcesses: ["vulval induction", "RTK–Ras signaling"], localization: ["plasma membrane"], downstreamTargets: ["sem-5"], interactionType: "recruits and activates", orthologs: ["EGFR"], difficulty: 2, explanation: "LET-23 receives the LIN-3/EGF signal and initiates the canonical Ras–ERK cascade.", references: ["wormbook-ras"] }),
  gene({ gene: "sem-5", pathway: "ras", molecularFunction: "a GRB2-family SH2/SH3 adaptor protein", biologicalProcesses: ["RTK-to-Ras signal coupling"], upstreamRegulators: ["let-23"], downstreamTargets: ["sos-1"], interactionType: "recruits", orthologs: ["GRB2"], difficulty: 2, explanation: "SEM-5 couples activated receptor tyrosine kinases to the SOS-1 Ras GEF.", references: ["wormbook-ras"] }),
  gene({ gene: "sos-1", pathway: "ras", molecularFunction: "a Ras guanine nucleotide exchange factor", biologicalProcesses: ["LET-60/Ras activation"], upstreamRegulators: ["sem-5"], downstreamTargets: ["let-60"], interactionType: "loads GTP onto", orthologs: ["SOS1", "SOS2"], difficulty: 3, explanation: "SOS-1 promotes formation of active LET-60/Ras-GTP downstream of multiple RTKs.", references: ["sos1-primary"] }),
  gene({ gene: "let-60", pathway: "ras", molecularFunction: "a Ras-family small GTPase", biologicalProcesses: ["vulval induction", "ERK pathway activation"], upstreamRegulators: ["sos-1"], downstreamTargets: ["lin-45"], interactionType: "activates", orthologs: ["KRAS"], difficulty: 2, explanation: "GTP-bound LET-60 activates the Raf–MEK–ERK kinase cascade.", references: ["wormbook-ras"] }),
  gene({ gene: "lin-45", pathway: "ras", molecularFunction: "a Raf-family MAP kinase kinase kinase", biologicalProcesses: ["ERK cascade signaling"], upstreamRegulators: ["let-60"], downstreamTargets: ["mek-2"], interactionType: "phosphorylates and activates", orthologs: ["RAF1", "BRAF", "ARAF"], difficulty: 3, explanation: "LIN-45 is the Raf step between LET-60/Ras and MEK-2.", references: ["wormbook-ras"] }),
  gene({ gene: "mek-2", pathway: "ras", molecularFunction: "a MAP kinase kinase", biologicalProcesses: ["ERK activation", "vulval development"], upstreamRegulators: ["lin-45"], downstreamTargets: ["mpk-1"], interactionType: "phosphorylates and activates", orthologs: ["MAP2K1", "MAP2K2"], difficulty: 3, explanation: "MEK-2 is required downstream of LIN-45/Raf to activate MPK-1/ERK.", references: ["wormbook-ras"] }),
  gene({ gene: "mpk-1", pathway: "ras", molecularFunction: "an ERK-family mitogen-activated protein kinase", biologicalProcesses: ["vulval cell-fate output", "germline development"], upstreamRegulators: ["mek-2"], interactionType: "phosphorylates downstream effectors", orthologs: ["MAPK1", "MAPK3"], difficulty: 2, explanation: "MPK-1 is the terminal ERK in the canonical LET-23–LET-60 kinase cascade.", references: ["wormbook-ras"] }),

  // Core apoptosis
  gene({ gene: "egl-1", pathway: "apoptosis", molecularFunction: "a pro-apoptotic BH3-only protein", biologicalProcesses: ["developmental programmed cell death"], downstreamTargets: ["ced-9"], interactionType: "binds and inhibits", orthologs: ["BH3-only protein family"], difficulty: 2, explanation: "EGL-1 binding to CED-9 releases the CED-9 brake on CED-4.", references: ["wormbook-apoptosis"] }),
  gene({ gene: "ced-9", pathway: "apoptosis", molecularFunction: "an anti-apoptotic BCL-2-family protein", biologicalProcesses: ["cell-survival control"], upstreamRegulators: ["egl-1"], downstreamTargets: ["ced-4"], interactionType: "sequesters and inhibits", orthologs: ["BCL2"], difficulty: 2, explanation: "CED-9 protects cells by binding CED-4 until EGL-1 disrupts that interaction.", references: ["wormbook-apoptosis"] }),
  gene({ gene: "ced-4", pathway: "apoptosis", molecularFunction: "an Apaf-1-like caspase activator", biologicalProcesses: ["apoptosome-like complex assembly", "CED-3 activation"], upstreamRegulators: ["ced-9"], downstreamTargets: ["ced-3"], interactionType: "activates", orthologs: ["APAF1"], difficulty: 2, explanation: "Released CED-4 oligomerizes and promotes activation of the CED-3 caspase.", references: ["wormbook-apoptosis"] }),
  gene({ gene: "ced-3", pathway: "apoptosis", molecularFunction: "an executioner caspase", biologicalProcesses: ["proteolysis during programmed cell death"], upstreamRegulators: ["ced-4"], interactionType: "cleaves cellular substrates", orthologs: ["caspase family"], difficulty: 2, explanation: "CED-3 is the protease that executes most canonical developmental cell deaths.", references: ["wormbook-apoptosis"] }),

  // TOR and AMPK nutrient sensing
  gene({ gene: "let-363", pathway: "tor", molecularFunction: "the sole TOR-family serine/threonine kinase", biologicalProcesses: ["nutrient sensing", "growth", "autophagy control"], downstreamTargets: ["rsks-1", "unc-51"], interactionType: "activates growth and inhibits autophagy initiation", orthologs: ["MTOR"], difficulty: 2, explanation: "LET-363 participates in TOR complexes that couple nutrient state to growth, translation, and autophagy.", references: ["wormbook-translation"] }),
  gene({ gene: "daf-15", pathway: "tor", molecularFunction: "the RAPTOR ortholog and TORC1 scaffold", biologicalProcesses: ["TORC1 substrate recruitment", "growth control"], upstreamRegulators: ["let-363"], downstreamTargets: ["rsks-1"], interactionType: "scaffolds", orthologs: ["RPTOR"], difficulty: 3, explanation: "DAF-15 defines the nutrient-responsive TORC1 complex with LET-363/TOR.", references: ["wormbook-translation"] }),
  gene({ gene: "raga-1", pathway: "tor", molecularFunction: "a RagA/B-family small GTPase", biologicalProcesses: ["amino-acid signaling to TORC1"], downstreamTargets: ["let-363/daf-15 complex"], interactionType: "promotes lysosomal TORC1 activation", orthologs: ["RRAGA", "RRAGB"], difficulty: 4, explanation: "RAGA-1 helps communicate amino-acid sufficiency to TORC1.", references: ["wormbook-translation"] }),
  gene({ gene: "rsks-1", pathway: "tor", molecularFunction: "an S6 kinase downstream of TORC1", biologicalProcesses: ["translation", "growth", "lifespan regulation"], upstreamRegulators: ["let-363", "daf-15"], interactionType: "phosphorylates translational targets", orthologs: ["RPS6KB1", "RPS6KB2"], difficulty: 3, explanation: "RSKS-1 is a conserved TORC1 effector that links nutrient signaling to protein synthesis.", references: ["wormbook-translation"] }),
  gene({ gene: "aak-1", pathway: "tor", molecularFunction: "an AMPK catalytic alpha subunit", biologicalProcesses: ["energy-stress sensing", "metabolic adaptation"], interactionType: "phosphorylates energy-response targets", orthologs: ["PRKAA1", "PRKAA2"], difficulty: 3, explanation: "AAK-1 is one of two catalytic AMPK alpha subunits in C. elegans.", references: ["wormbook-iis"] }),
  gene({ gene: "aak-2", pathway: "tor", molecularFunction: "an AMPK catalytic alpha subunit central to energy-stress and longevity responses", biologicalProcesses: ["low-energy adaptation", "dauer and longevity regulation"], downstreamTargets: ["anabolic pathways"], interactionType: "inhibits energy-consuming programs", orthologs: ["PRKAA1", "PRKAA2"], difficulty: 2, explanation: "AAK-2 helps shift physiology away from growth when cellular energy is limited.", references: ["wormbook-iis"] }),

  // ER unfolded protein response
  gene({ gene: "ire-1", pathway: "uprer", molecularFunction: "an ER transmembrane kinase and endoribonuclease", biologicalProcesses: ["unconventional xbp-1 mRNA splicing", "ER stress sensing"], localization: ["endoplasmic reticulum membrane"], downstreamTargets: ["xbp-1"], interactionType: "splices mRNA encoding", orthologs: ["ERN1", "ERN2"], difficulty: 2, explanation: "IRE-1 removes an unconventional intron from xbp-1 mRNA to generate the active transcription factor.", references: ["wormbook-translation"] }),
  gene({ gene: "xbp-1", pathway: "uprer", molecularFunction: "a bZIP transcription factor activated by IRE-1-dependent mRNA splicing", biologicalProcesses: ["ER chaperone transcription", "secretory proteostasis"], localization: ["nucleus after activation"], upstreamRegulators: ["ire-1"], downstreamTargets: ["hsp-4"], interactionType: "transcriptionally activates", orthologs: ["XBP1"], difficulty: 2, explanation: "Spliced XBP-1 drives an adaptive ER-folding and quality-control program.", references: ["wormbook-translation"] }),
  gene({ gene: "pek-1", pathway: "uprer", molecularFunction: "a PERK-family ER stress kinase", biologicalProcesses: ["eIF2α phosphorylation", "translational attenuation during ER stress"], localization: ["endoplasmic reticulum membrane"], interactionType: "phosphorylates", orthologs: ["EIF2AK3"], difficulty: 3, explanation: "PEK-1 reduces bulk translation through eIF2α phosphorylation, complementing the IRE-1/XBP-1 branch.", references: ["wormbook-translation"] }),
  gene({ gene: "atf-6", pathway: "uprer", molecularFunction: "an ER stress-responsive membrane-tethered transcription factor", biologicalProcesses: ["UPR transcription", "ER proteostasis"], localization: ["endoplasmic reticulum membrane", "nucleus after activation and processing"], interactionType: "transcriptionally activates", orthologs: ["ATF6"], difficulty: 3, explanation: "ATF-6 represents a UPRER branch distinct from IRE-1/XBP-1 and PEK-1.", references: ["wormbook-translation"] }),
  gene({ gene: "hsp-4", pathway: "uprer", molecularFunction: "an ER-lumen Hsp70/BiP-family chaperone", biologicalProcesses: ["protein folding in the ER", "UPR reporter output"], localization: ["endoplasmic reticulum lumen"], upstreamRegulators: ["xbp-1"], interactionType: "assists folding", orthologs: ["HSPA5/BiP"], difficulty: 2, explanation: "hsp-4 transcriptional reporters are widely used readouts of UPRER activation, but they report transcription rather than folding capacity directly.", references: ["wormbook-translation"] }),

  // Mitochondrial unfolded protein response
  gene({ gene: "atfs-1", pathway: "uprmt", molecularFunction: "an import-regulated bZIP transcription factor", biologicalProcesses: ["mitochondrial stress signaling", "UPRmt transcription"], localization: ["mitochondria in homeostasis", "nucleus when mitochondrial import is compromised"], downstreamTargets: ["hsp-6", "hsp-60"], interactionType: "transcriptionally activates", orthologs: ["ATF5, functionally analogous"], difficulty: 3, explanation: "Reduced mitochondrial import diverts ATFS-1 from mitochondrial degradation to the nucleus.", references: ["uprmt-review"] }),
  gene({ gene: "ubl-5", pathway: "uprmt", molecularFunction: "a small ubiquitin-like protein required for a full mitochondrial stress response", biologicalProcesses: ["UPRmt transcriptional regulation"], downstreamTargets: ["dve-1-associated program"], interactionType: "cooperates with", orthologs: ["UBL5"], difficulty: 4, explanation: "UBL-5 works with DVE-1 in the nuclear arm of the canonical C. elegans UPRmt.", references: ["uprmt-review"] }),
  gene({ gene: "dve-1", pathway: "uprmt", molecularFunction: "a homeodomain transcriptional regulator", biologicalProcesses: ["chromatin and transcriptional response to mitochondrial stress"], localization: ["nucleus"], upstreamRegulators: ["ubl-5-associated signaling"], downstreamTargets: ["hsp-6", "hsp-60"], interactionType: "transcriptionally regulates", orthologs: ["SATB-like proteins, distant"], difficulty: 4, explanation: "DVE-1 cooperates with UBL-5 and ATFS-1-associated signaling to induce mitochondrial protective genes.", references: ["uprmt-review"] }),
  gene({ gene: "clpp-1", pathway: "uprmt", molecularFunction: "a mitochondrial matrix caseinolytic peptidase", biologicalProcesses: ["mitochondrial protein quality control", "UPRmt signaling"], localization: ["mitochondrial matrix"], interactionType: "degrades misfolded proteins", orthologs: ["CLPP"], difficulty: 3, explanation: "CLPP-1 degrades damaged mitochondrial proteins and was identified as an upstream requirement in canonical UPRmt models.", references: ["uprmt-review"] }),
  gene({ gene: "hsp-6", pathway: "uprmt", molecularFunction: "a mitochondrial Hsp70-family chaperone", biologicalProcesses: ["mitochondrial protein folding", "UPRmt reporter output"], localization: ["mitochondria"], upstreamRegulators: ["atfs-1", "dve-1"], interactionType: "assists folding", orthologs: ["HSPA9"], difficulty: 2, explanation: "hsp-6 reporters are common transcriptional readouts of the mitochondrial unfolded protein response.", references: ["uprmt-review"] }),
  gene({ gene: "hsp-60", pathway: "uprmt", molecularFunction: "a mitochondrial chaperonin", biologicalProcesses: ["mitochondrial protein folding", "proteostasis"], localization: ["mitochondrial matrix"], upstreamRegulators: ["atfs-1", "dve-1"], interactionType: "assists folding", orthologs: ["HSPD1"], difficulty: 2, explanation: "HSP-60 folds mitochondrial proteins and is induced in mitochondrial proteotoxic stress programs.", references: ["uprmt-review"] }),

  // Proteasome and oxidative stress
  gene({ gene: "rpn-6.1", pathway: "proteostasis", molecularFunction: "a non-ATPase subunit of the 19S proteasome regulatory particle", biologicalProcesses: ["ubiquitin-dependent protein degradation", "proteasome assembly or stability"], localization: ["cytosol", "nucleus"], interactionType: "forms part of", orthologs: ["PSMD11"], difficulty: 3, explanation: "RPN-6.1 contributes to the 19S regulatory particle rather than the proteolytic 20S core.", references: ["proteasome-review"] }),
  gene({ gene: "rpn-10", pathway: "proteostasis", molecularFunction: "a ubiquitin-receptor subunit of the 19S proteasome", biologicalProcesses: ["recognition of ubiquitylated substrates"], interactionType: "binds ubiquitin chains", orthologs: ["PSMD4"], difficulty: 3, explanation: "RPN-10 helps the proteasome recognize ubiquitin-tagged substrates.", references: ["proteasome-review"] }),
  gene({ gene: "rpt-3", pathway: "proteostasis", molecularFunction: "an AAA+ ATPase subunit of the 19S proteasome base", biologicalProcesses: ["substrate unfolding", "translocation into the 20S core"], interactionType: "uses ATP to unfold and translocate", orthologs: ["PSMC4"], difficulty: 4, explanation: "RPT ATPases mechanically unfold substrates and feed them into the proteolytic core.", references: ["proteasome-review"] }),
  gene({ gene: "pbs-5", pathway: "proteostasis", molecularFunction: "a beta subunit of the 20S proteasome core", biologicalProcesses: ["proteolysis within the proteasome"], interactionType: "forms the catalytic core", orthologs: ["PSMB family"], difficulty: 3, explanation: "PBS proteins belong to the beta rings of the 20S core, several of which provide proteolytic active sites.", references: ["proteasome-review"] }),
  gene({ gene: "pas-5", pathway: "proteostasis", molecularFunction: "an alpha subunit of the 20S proteasome core", biologicalProcesses: ["20S gate and core-particle architecture"], interactionType: "forms the core gate", orthologs: ["PSMA family"], difficulty: 4, explanation: "PAS proteins form the outer alpha rings that gate access to the 20S proteolytic chamber.", references: ["proteasome-review"] }),
  gene({ gene: "skn-1", pathway: "proteostasis", molecularFunction: "a CNC-family transcription factor related to NRF proteins", biologicalProcesses: ["oxidative stress defense", "detoxification", "proteasome homeostasis"], localization: ["nucleus when activated"], interactionType: "transcriptionally activates", orthologs: ["NFE2L1/NRF1", "NFE2L2/NRF2"], difficulty: 2, explanation: "SKN-1 coordinates detoxification and proteostasis programs, including a proteasome recovery response.", references: ["wormbook-immunity"] }),

  // RNA interference
  gene({ gene: "rde-4", pathway: "rnai", molecularFunction: "a long-double-stranded-RNA-binding protein", biologicalProcesses: ["primary exogenous siRNA production"], upstreamRegulators: ["long dsRNA"], downstreamTargets: ["dcr-1", "rde-1"], interactionType: "binds dsRNA and recruits", orthologs: ["no simple one-to-one mammalian ortholog"], difficulty: 2, explanation: "RDE-4 binds long trigger dsRNA and collaborates with DCR-1 in exogenous RNAi.", references: ["wormbook-rnai"] }),
  gene({ gene: "dcr-1", pathway: "rnai", molecularFunction: "the sole Dicer-family RNase III enzyme", biologicalProcesses: ["processing long dsRNA into primary siRNAs", "microRNA biogenesis"], upstreamRegulators: ["rde-4"], downstreamTargets: ["rde-1-loaded small RNAs"], interactionType: "cleaves", orthologs: ["DICER1"], difficulty: 2, explanation: "DCR-1 participates in multiple small-RNA pathways, so a dcr-1 phenotype is not specific to exogenous RNAi.", references: ["wormbook-rnai"] }),
  gene({ gene: "rde-1", pathway: "rnai", molecularFunction: "an Argonaute that receives primary exogenous siRNAs", biologicalProcesses: ["target recognition in exogenous RNAi"], upstreamRegulators: ["dcr-1", "rde-4"], interactionType: "binds guide RNA and target RNA", orthologs: ["Argonaute family"], difficulty: 2, explanation: "RDE-1 uses primary siRNAs to initiate silencing and downstream amplification.", references: ["wormbook-rnai"] }),
  gene({ gene: "sid-1", pathway: "rnai", molecularFunction: "a transmembrane channel required for systemic dsRNA uptake between tissues", biologicalProcesses: ["systemic RNA interference"], localization: ["plasma membrane"], interactionType: "transports dsRNA", orthologs: ["SIDT1", "SIDT2"], difficulty: 2, explanation: "SID-1 enables systemic spread or uptake of the RNAi trigger but is not the Dicer nuclease.", references: ["wormbook-rnai"] }),
  gene({ gene: "sid-2", pathway: "rnai", molecularFunction: "an intestinal luminal transmembrane protein required for environmental RNAi", biologicalProcesses: ["uptake of ingested dsRNA"], localization: ["intestinal apical membrane"], downstreamTargets: ["sid-1-dependent systemic transport"], interactionType: "promotes environmental dsRNA uptake", orthologs: [], difficulty: 3, explanation: "SID-2 is especially important for entry of ingested dsRNA from the intestinal lumen.", references: ["wormbook-rnai"] }),
  gene({ gene: "mut-7", pathway: "rnai", molecularFunction: "a 3′–5′ exonuclease-associated mutator protein", biologicalProcesses: ["RNAi amplification or maintenance", "transposon silencing"], interactionType: "supports secondary silencing", orthologs: ["RNASET2-like nuclease domain relationship"], difficulty: 4, explanation: "MUT-7 acts downstream in robust small-RNA silencing and genome defense rather than in initial dsRNA uptake.", references: ["wormbook-rnai"] }),

  // DNA damage response and homologous recombination
  gene({ gene: "atl-1", pathway: "dna", molecularFunction: "an ATR-family checkpoint kinase", biologicalProcesses: ["replication-stress signaling", "DNA damage checkpoint"], localization: ["nucleus"], interactionType: "phosphorylates checkpoint targets", orthologs: ["ATR"], difficulty: 3, explanation: "ATL-1 is most closely associated with replication stress and single-stranded-DNA-associated checkpoint signaling.", references: ["dna-review"] }),
  gene({ gene: "atm-1", pathway: "dna", molecularFunction: "an ATM-family DNA damage checkpoint kinase", biologicalProcesses: ["double-strand-break response", "genome stability"], localization: ["nucleus"], interactionType: "phosphorylates checkpoint targets", orthologs: ["ATM"], difficulty: 3, explanation: "ATM-1 contributes to double-strand-break signaling and genome maintenance.", references: ["dna-review"] }),
  gene({ gene: "cep-1", pathway: "dna", molecularFunction: "the C. elegans p53-family transcription factor", biologicalProcesses: ["DNA-damage-induced germ-cell apoptosis", "checkpoint transcription"], downstreamTargets: ["egl-1"], interactionType: "transcriptionally activates", orthologs: ["TP53", "TP63", "TP73"], difficulty: 2, explanation: "CEP-1 can connect genotoxic stress to the core apoptotic machinery by inducing pro-death genes such as egl-1.", references: ["dna-review"] }),
  gene({ gene: "rad-51", pathway: "dna", molecularFunction: "a recombinase that forms nucleoprotein filaments on single-stranded DNA", biologicalProcesses: ["homologous recombination", "double-strand-break repair"], localization: ["nuclear repair foci"], interactionType: "catalyzes strand exchange", orthologs: ["RAD51"], difficulty: 2, explanation: "RAD-51 foci indicate recruitment to recombination intermediates, not successful repair by themselves.", references: ["dna-review"] }),
  gene({ gene: "brc-1", pathway: "dna", molecularFunction: "a BRCA1-family genome-stability protein and E3 ligase complex component", biologicalProcesses: ["homologous recombination", "meiotic chromosome integrity"], downstreamTargets: ["rad-51-associated repair"], interactionType: "forms a complex with", orthologs: ["BRCA1"], difficulty: 3, explanation: "BRC-1 partners with BRD-1 in DNA repair and chromosome maintenance.", references: ["dna-review"] }),
  gene({ gene: "brd-1", pathway: "dna", molecularFunction: "a BARD1-family partner of BRC-1", biologicalProcesses: ["DNA repair", "chromosome integrity"], upstreamRegulators: ["brc-1 complex"], interactionType: "heterodimerizes with", orthologs: ["BARD1"], difficulty: 4, explanation: "BRD-1 is the BARD1-like binding partner in the BRC-1/BRD-1 genome-stability complex.", references: ["dna-review"] }),

  // Cell cycle
  gene({ gene: "cdk-1", pathway: "cellcycle", molecularFunction: "the major cyclin-dependent kinase driving entry into mitosis", biologicalProcesses: ["G2/M transition", "mitosis"], interactionType: "phosphorylates mitotic substrates", orthologs: ["CDK1"], difficulty: 2, explanation: "CDK-1 activity with mitotic cyclins drives the cell into M phase.", references: ["wormbook-celldivision"] }),
  gene({ gene: "cdk-2", pathway: "cellcycle", molecularFunction: "a cyclin-dependent kinase functioning in S-phase and germline cell-cycle control", biologicalProcesses: ["DNA replication", "cell-cycle progression"], interactionType: "phosphorylates cell-cycle substrates", orthologs: ["CDK2"], difficulty: 3, explanation: "CDK-2 functions earlier in the cycle than the principal mitotic kinase CDK-1.", references: ["wormbook-celldivision"] }),
  gene({ gene: "cye-1", pathway: "cellcycle", molecularFunction: "an E-type cyclin", biologicalProcesses: ["G1/S transition", "S-phase entry"], downstreamTargets: ["cdk-2"], interactionType: "binds and activates", orthologs: ["CCNE1", "CCNE2"], difficulty: 2, explanation: "CYE-1 forms an active cyclin–CDK complex that promotes cell-cycle entry and DNA replication.", references: ["wormbook-celldivision"] }),
  gene({ gene: "cyd-1", pathway: "cellcycle", molecularFunction: "a D-type cyclin", biologicalProcesses: ["G1 progression", "cell-cycle entry"], downstreamTargets: ["cdk-4"], interactionType: "binds and activates", orthologs: ["CCND family"], difficulty: 2, explanation: "CYD-1 acts with CDK-4 in the G1 cell-cycle module upstream of retinoblastoma-family control.", references: ["wormbook-celldivision"] }),
  gene({ gene: "lin-35", pathway: "cellcycle", molecularFunction: "the retinoblastoma-family pocket protein", biologicalProcesses: ["repression of cell-cycle transcription", "developmental gene regulation"], upstreamRegulators: ["cyd-1/cdk-4 module"], interactionType: "represses transcription with E2F complexes", orthologs: ["RB1", "RBL1", "RBL2"], difficulty: 3, explanation: "LIN-35 is the sole Rb-family protein in C. elegans and participates in transcriptional repression.", references: ["wormbook-celldivision"] }),
  gene({ gene: "cki-1", pathway: "cellcycle", molecularFunction: "a CIP/KIP-family cyclin-dependent kinase inhibitor", biologicalProcesses: ["cell-cycle arrest", "differentiation-associated cell-cycle exit"], downstreamTargets: ["cyclin–CDK complexes"], interactionType: "inhibits", orthologs: ["CDKN1A", "CDKN1B", "CDKN1C"], difficulty: 2, explanation: "CKI-1 restrains cyclin–CDK activity and promotes cell-cycle exit.", references: ["wormbook-celldivision"] }),

  // Wnt signaling
  gene({ gene: "mom-2", pathway: "wnt", molecularFunction: "a secreted Wnt ligand", biologicalProcesses: ["embryonic cell polarity", "endoderm specification"], downstreamTargets: ["mom-5"], interactionType: "binds and activates", orthologs: ["WNT family"], difficulty: 2, explanation: "MOM-2 is a Wnt signal used in embryonic and postembryonic patterning contexts.", references: ["wormbook-wnt"] }),
  gene({ gene: "mom-5", pathway: "wnt", molecularFunction: "a Frizzled-family Wnt receptor", biologicalProcesses: ["Wnt signal reception", "embryonic polarity"], localization: ["plasma membrane"], upstreamRegulators: ["mom-2"], interactionType: "binds Wnt ligand", orthologs: ["FZD family"], difficulty: 2, explanation: "MOM-5 is a Frizzled receptor that receives MOM-2 and other Wnt signals in context-dependent pathways.", references: ["wormbook-wnt"] }),
  gene({ gene: "bar-1", pathway: "wnt", molecularFunction: "a beta-catenin used in canonical Wnt signaling", biologicalProcesses: ["Wnt-dependent transcription", "cell migration and fate"], localization: ["cytoplasm", "nucleus when stabilized"], interactionType: "coactivates transcription", orthologs: ["CTNNB1"], difficulty: 3, explanation: "BAR-1 is the beta-catenin of a canonical Wnt branch, whereas other worm beta-catenins have specialized roles.", references: ["wormbook-wnt"] }),
  gene({ gene: "pop-1", pathway: "wnt", molecularFunction: "a TCF/LEF-family DNA-binding transcription factor", biologicalProcesses: ["Wnt-responsive cell-fate specification", "asymmetric division outputs"], localization: ["nucleus"], interactionType: "represses or activates transcription depending on context and cofactors", orthologs: ["TCF7", "TCF7L1", "TCF7L2", "LEF1"], difficulty: 3, explanation: "POP-1 output depends on nuclear level and beta-catenin partners; it is not a simple constitutive activator.", references: ["wormbook-wnt"] }),

  // Notch signaling
  gene({ gene: "lin-12", pathway: "notch", molecularFunction: "one of two C. elegans Notch receptors", biologicalProcesses: ["somatic cell-fate decisions", "anchor-cell/vulval-precursor decision"], localization: ["plasma membrane", "nucleus after intracellular-domain release"], downstreamTargets: ["lag-1"], interactionType: "activates transcription with", orthologs: ["NOTCH1–4"], difficulty: 2, explanation: "LIN-12 is a Notch receptor widely used in somatic binary cell-fate decisions.", references: ["wormbook-notch"] }),
  gene({ gene: "glp-1", pathway: "notch", molecularFunction: "one of two C. elegans Notch receptors", biologicalProcesses: ["germline stem-cell maintenance", "embryonic cell interactions"], localization: ["plasma membrane", "nucleus after intracellular-domain release"], downstreamTargets: ["lag-1"], interactionType: "activates transcription with", orthologs: ["NOTCH1–4"], difficulty: 2, explanation: "GLP-1/Notch maintains distal germline progenitors and mediates key embryonic interactions.", references: ["wormbook-notch"] }),
  gene({ gene: "lag-1", pathway: "notch", molecularFunction: "a CSL-family sequence-specific DNA-binding protein", biologicalProcesses: ["Notch-responsive transcription"], localization: ["nucleus"], upstreamRegulators: ["lin-12", "glp-1"], interactionType: "switches transcriptional state with Notch intracellular domain", orthologs: ["RBPJ"], difficulty: 3, explanation: "LAG-1 is the nuclear DNA-binding effector shared by the LIN-12 and GLP-1 Notch receptors.", references: ["wormbook-notch"] }),

  // DAF-7/TGF-beta dauer signaling
  gene({ gene: "daf-7", pathway: "tgf", molecularFunction: "a secreted TGF-beta-superfamily ligand", biologicalProcesses: ["environmental regulation of dauer entry", "neuroendocrine signaling"], localization: ["secreted from ASI sensory neurons under favorable conditions"], downstreamTargets: ["daf-1", "daf-4"], interactionType: "binds receptor complex", orthologs: ["TGF-beta superfamily"], difficulty: 2, explanation: "Favorable conditions promote DAF-7 signaling, which favors reproductive development rather than dauer entry.", references: ["wormbook-tgf"] }),
  gene({ gene: "daf-1", pathway: "tgf", molecularFunction: "a type I TGF-beta-family receptor serine/threonine kinase", biologicalProcesses: ["DAF-7 signal transduction", "dauer inhibition"], upstreamRegulators: ["daf-7", "daf-4"], downstreamTargets: ["daf-8", "daf-14"], interactionType: "phosphorylates receptor Smads", orthologs: ["TGFBR1/ACVR-like receptors"], difficulty: 3, explanation: "DAF-1 is the type I receptor in the DAF-7 dauer-regulatory pathway.", references: ["wormbook-tgf"] }),
  gene({ gene: "daf-4", pathway: "tgf", molecularFunction: "the sole type II TGF-beta-family receptor in C. elegans", biologicalProcesses: ["DAF-7 and DBL-1 pathway signaling"], upstreamRegulators: ["daf-7"], downstreamTargets: ["daf-1"], interactionType: "forms receptor complexes and activates type I receptors", orthologs: ["TGFBR2", "BMPR2", "ACVR2 family"], difficulty: 3, explanation: "DAF-4 is shared between more than one TGF-beta-superfamily pathway, so its phenotypes need pathway context.", references: ["wormbook-tgf"] }),
  gene({ gene: "daf-8", pathway: "tgf", molecularFunction: "a receptor-regulated Smad in the DAF-7 pathway", biologicalProcesses: ["transduction of favorable-environment signals", "dauer inhibition"], upstreamRegulators: ["daf-1", "daf-4"], interactionType: "regulates transcription with Smad partners", orthologs: ["R-Smad family"], difficulty: 3, explanation: "DAF-8 and DAF-14 have partially redundant R-Smad-like functions downstream of the receptors.", references: ["wormbook-tgf"] }),
  gene({ gene: "daf-14", pathway: "tgf", molecularFunction: "a receptor-regulated Smad-like protein in the DAF-7 pathway", biologicalProcesses: ["dauer inhibition", "TGF-beta signal transduction"], upstreamRegulators: ["daf-1", "daf-4"], interactionType: "regulates transcription with Smad partners", orthologs: ["R-Smad family"], difficulty: 4, explanation: "DAF-14 overlaps with DAF-8 but is structurally divergent in its N-terminal region.", references: ["wormbook-tgf"] }),

  // Innate immunity
  gene({ gene: "nsy-1", pathway: "immunity", molecularFunction: "an ASK1-family MAP kinase kinase kinase", biologicalProcesses: ["p38 MAPK innate immune signaling"], downstreamTargets: ["sek-1"], interactionType: "phosphorylates and activates", orthologs: ["MAP3K5/ASK1"], difficulty: 3, explanation: "NSY-1 is the MAP3K upstream of SEK-1 and PMK-1 in a conserved immune-defense module.", references: ["wormbook-immunity"] }),
  gene({ gene: "sek-1", pathway: "immunity", molecularFunction: "a MAP kinase kinase in the p38 immune pathway", biologicalProcesses: ["innate immune defense"], upstreamRegulators: ["nsy-1"], downstreamTargets: ["pmk-1"], interactionType: "phosphorylates and activates", orthologs: ["MAP2K3", "MAP2K6"], difficulty: 3, explanation: "SEK-1 is the MAP2K linking NSY-1 to PMK-1/p38.", references: ["wormbook-immunity"] }),
  gene({ gene: "pmk-1", pathway: "immunity", molecularFunction: "a p38-family mitogen-activated protein kinase", biologicalProcesses: ["intestinal and epidermal innate immunity", "stress signaling"], upstreamRegulators: ["sek-1"], downstreamTargets: ["atf-7"], interactionType: "phosphorylates regulatory targets", orthologs: ["MAPK14/p38 alpha family"], difficulty: 2, explanation: "PMK-1 is required for resistance to multiple pathogens and regulates immune-effector transcription.", references: ["wormbook-immunity"] }),
  gene({ gene: "atf-7", pathway: "immunity", molecularFunction: "a bZIP transcription factor regulated by PMK-1", biologicalProcesses: ["pathogen-responsive immune transcription"], localization: ["nucleus"], upstreamRegulators: ["pmk-1"], interactionType: "switches from repression toward activation after pathway signaling", orthologs: ["ATF2/ATF7 family"], difficulty: 4, explanation: "ATF-7 connects PMK-1 activity to expression of many intestinal immune effectors.", references: ["wormbook-immunity"] }),
  gene({ gene: "zip-2", pathway: "immunity", molecularFunction: "a bZIP transcription factor in a distinct infection-response pathway", biologicalProcesses: ["response to translation-blocking pathogens", "innate immune effector transcription"], localization: ["nucleus when induced"], interactionType: "transcriptionally activates", orthologs: [], difficulty: 4, explanation: "ZIP-2 defines an immune-response branch that should not be collapsed into the NSY-1–SEK-1–PMK-1 cascade.", references: ["wormbook-immunity"] }),
  gene({ gene: "fshr-1", pathway: "immunity", molecularFunction: "a leucine-rich-repeat G-protein-coupled receptor", biologicalProcesses: ["intestinal defense", "stress and homeostatic signaling"], localization: ["plasma membrane"], interactionType: "signals through a partially distinct immune branch", orthologs: ["glycoprotein hormone receptor family"], difficulty: 4, explanation: "FSHR-1 supports intestinal defense through signaling that is not simply a linear extension of PMK-1.", references: ["wormbook-immunity"] })
];

const unique = (items) => [...new Set(items.filter(Boolean))];

function mergeOrganelles(left, right) {
  const byId = new Map();
  for (const entry of [...left, ...right]) byId.set(entry.organelle, entry);
  return [...byId.values()];
}

function mergeGeneRecords(left, right) {
  if (!left) return right;
  return {
    ...right,
    ...left,
    aliases: unique([...left.aliases, ...right.aliases]),
    pathways: unique([...left.pathways, ...right.pathways]),
    biologicalProcesses: unique([...left.biologicalProcesses, ...right.biologicalProcesses]),
    cellularLocalization: unique([...left.cellularLocalization, ...right.cellularLocalization]),
    organelles: mergeOrganelles(left.organelles, right.organelles),
    tissues: unique([...left.tissues, ...right.tissues]),
    cellTypes: unique([...left.cellTypes, ...right.cellTypes]),
    localizationStates: [...left.localizationStates, ...right.localizationStates].filter((state, index, all) => all.findIndex((candidate) => candidate.condition === state.condition && candidate.location === state.location) === index),
    reporterContexts: unique([...left.reporterContexts, ...right.reporterContexts]),
    upstreamRegulators: unique([...left.upstreamRegulators, ...right.upstreamRegulators]),
    downstreamTargets: unique([...left.downstreamTargets, ...right.downstreamTargets]),
    phenotypes: unique([...left.phenotypes, ...right.phenotypes]),
    orthologs: unique([...left.orthologs, ...right.orthologs]),
    references: unique([...left.references, ...right.references]),
    recognitionSafe: left.recognitionSafe || right.recognitionSafe
  };
}

function blindText(record) {
  let text = `This molecule functions as ${record.molecularFunction}. It contributes to ${record.biologicalProcesses.slice(0, 3).join(", ")}.`;
  const compartment = record.organelles[0]?.organelle?.replaceAll("_", " ");
  if (compartment) text += ` Its best-established site of action is associated with the ${compartment}.`;
  if (record.orthologs.length) text += ` It belongs to the ${record.orthologs.join(" / ")} ortholog or protein family.`;
  for (const forbidden of [record.gene, ...record.aliases].sort((a, b) => b.length - a.length)) {
    const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "gi"), "this gene product");
  }
  return text;
}

function enrichDescription(record) {
  const pathwayText = record.pathways.map((value) => value.replaceAll("_", " ")).join(", ");
  const spatialText = record.organelles.length
    ? `Its established spatial context includes ${record.organelles.map((entry) => entry.organelle.replaceAll("_", " ")).join(", ")}${record.tissues.length ? ` in ${record.tissues.map((value) => value.replaceAll("_", " ")).join(", ")}` : ""}.`
    : `Its exact subcellular context depends on the tissue and experimental condition.`;
  const movementText = record.localizationStates.length
    ? `Localization is regulated: ${record.localizationStates.map((state) => `${state.condition} → ${state.location}`).join("; ")}.`
    : `Expression, physical localization, molecular site of action, and organismal phenotype should be interpreted as separate evidence layers.`;
  return `${record.gene} encodes ${record.molecularFunction}. It participates in ${record.biologicalProcesses.join(", ")} within the ${pathwayText} network${record.pathways.length > 1 ? "s" : ""}. ${spatialText} ${movementText} ${record.explanation}`;
}

const MAX_CURATED_GENES = 390;
const coreGeneNames = new Set(coreGenes.map((record) => record.gene));
const expansionBuckets = new Map();
for (const config of expandedGeneConfigs) {
  if (!expansionBuckets.has(config.pathway)) expansionBuckets.set(config.pathway, []);
  expansionBuckets.get(config.pathway).push(gene(config));
}

const selectedExpansion = [];
const selectedGeneNames = new Set(coreGeneNames);
let round = 0;
let addedThisRound = true;
while (addedThisRound) {
  addedThisRound = false;
  for (const bucket of expansionBuckets.values()) {
    const record = bucket[round];
    if (!record) continue;
    addedThisRound = true;
    if (selectedGeneNames.has(record.gene) || selectedGeneNames.size < MAX_CURATED_GENES) {
      selectedExpansion.push(record);
      selectedGeneNames.add(record.gene);
    }
  }
  round += 1;
}

const mergedGenes = new Map();
for (const record of [...coreGenes, ...selectedExpansion]) {
  mergedGenes.set(record.gene, mergeGeneRecords(mergedGenes.get(record.gene), record));
}

const crossPathwayMembership = {
  "daf-16": ["iis", "oxidativeStress", "heatShock"], "skn-1": ["iis", "oxidativeStress", "immunity", "proteasome"], "hsf-1": ["iis", "heatShock"],
  "sgk-1": ["iis", "tor"], "hlh-30": ["tor", "autophagy", "lysosome"], "pha-4": ["tor", "cellAtlas"], "let-363": ["tor", "autophagy", "translation"],
  "rsks-1": ["tor", "translation"], "aak-2": ["tor", "oxidativeStress"], "sqst-1": ["autophagy", "mitophagy", "proteasome"], "lgg-1": ["autophagy", "mitophagy"],
  "bec-1": ["autophagy", "mitophagy", "endocytosis"], "atg-7": ["autophagy", "mitophagy"], "rab-7": ["lysosome", "endocytosis", "autophagy"],
  "atfs-1": ["uprmt", "respiration"], "drp-1": ["mitochondrialDynamics", "mitophagy"], "pink-1": ["mitophagy", "mitochondrialDynamics"],
  "daf-4": ["daf7", "bmp", "tgf"], "glp-1": ["notch", "germlineStemCells"], "lag-2": ["notch", "germlineStemCells"],
  "pmk-1": ["immunity", "oxidativeStress"], "sek-1": ["immunity", "oxidativeStress"], "ced-10": ["engulfment", "cellAtlas"],
  "rad-51": ["homologousRecombination", "meiosis", "dna"], "mre-11": ["homologousRecombination", "meiosis"], "brc-1": ["homologousRecombination", "dna"],
  "lin-35": ["cellcycle", "dream"], "lin-53": ["dream", "chromatin"], "pop-1": ["wnt", "polarity"], "par-4": ["tor", "polarity"],
  "rme-1": ["endocytosis", "cellAtlas"], "rme-6": ["endocytosis", "cellAtlas"], "rab-3": ["synapticVesicle", "neurotransmission"],
  "unc-2": ["synapticVesicle", "neurotransmission"], "daf-19": ["cilium", "cellAtlas"], "tax-4": ["chemosensation", "cilium"],
  "mec-4": ["mechanosensation", "cellAtlas"], "nhr-49": ["lipidMetabolism", "peroxisome"], "ctl-2": ["oxidativeStress", "peroxisome"],
  "pat-3": ["basementMembrane", "muscle"], "pkc-3": ["polarity", "epithelialPolarity"], "pie-1": ["polarity", "cellAtlas", "chromatin"],
  "lin-29": ["heterochronic", "cellAtlas"], "let-23": ["ras", "cellAtlas"], "lin-12": ["notch", "cellAtlas"]
};
for (const [name, pathwayIds] of Object.entries(crossPathwayMembership)) {
  const record = mergedGenes.get(name);
  if (record) record.pathways = unique([...record.pathways, ...pathwayIds]);
}

export const genes = [...mergedGenes.values()].map((record) => ({
  ...record,
  recognitionPrompt: blindText(record),
  description: enrichDescription(record)
}));

export const geneByName = new Map(genes.map((record) => [record.gene, record]));
