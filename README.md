# WormPath

WormPath is an adaptive, static assessment and learning game for *Caenorhabditis elegans* molecular and cell biology. It connects genes to molecular functions, pathways, organelles, regulated localization, cell types, tissues, perturbations, epistasis, and experimental evidence.

## Run locally

No build step or backend is required.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

Run the assessment-engine tests with Node 20 or newer:

```bash
npm test
```

## Assessment and scoring model

Questions carry a hidden difficulty from 1 (School) to 5 (Professor). A session starts at ability 2.0 (BSc). The next-question selector favors items near the current estimate while balancing under-sampled question types, pathways, and knowledge domains. **Integrated biology** mixes the complete graph; **Cell Atlas focus** prioritizes organelles, localization, trafficking, tissues, and anatomy.

Ability updates use a compact item-response-style rule:

1. Expected success is logistic in the difference between current ability and item difficulty.
2. The update is proportional to `observed score − expected score`.
3. A wrong item far above the player's current ability therefore has little negative effect.
4. Epistasis, topology, and experimental-interpretation items have slightly greater discrimination.
5. Learning rate is smaller in longer assessments so the estimate stabilizes as evidence accumulates.

Multiple-selection scoring subtracts the false-positive rate from sensitivity. Selecting every option therefore earns no advantage. Ordering receives pairwise-order credit, and multi-blank completion receives per-position credit. A response is locked and persisted before feedback is shown, preventing double scoring after refresh.

Final labels are based on the adaptive ability estimate, not raw percentage alone:

- School: below 1.70
- BSc: 1.70–2.59
- MSc: 2.60–3.49
- PhD: 3.50–4.24
- Professor: 4.25 and above

## Biology data

The current release contains:

- 390 curated genes across 62 biological modules
- 40 organelle/compartment objects and 24 cell/tissue objects
- multi-pathway membership for major integrators
- regulated localization states for factors such as DAF-16, HLH-30, ATFS-1, and HIF-1
- 2,100+ distinct assessment questions
- 75+ reporter/experimental-interpretation questions and 50+ epistasis questions

Core records live in [`data/genes.js`](data/genes.js); the expanded module annotations are in [`data/expandedGenes.js`](data/expandedGenes.js). Spatial objects, trafficking routes, reporters, and inter-tissue scenarios are in [`data/spatialAtlas.js`](data/spatialAtlas.js). Pathway objects include nodes, typed edges, outputs, reporters, and common misconceptions in [`data/expandedPathways.js`](data/expandedPathways.js).

Every gene has a long-form description assembled from its molecular role, processes, pathways, compartments, tissues, and localization state. Function-to-gene questions use a separate blinded description, and automated tests ensure the answer gene name never appears in the prompt.

After an answer is locked, WormPath shows a plain-language explanation first and defines common technical terms in context. The original detailed explanation remains available under **Show more biological detail**. Tests ensure every question has this simpler teaching layer, including explicit definitions for the anchor-cell EGF example.

## Learning library

The in-app learning library provides:

- direct links to WormBase, WormAtlas, Alliance of Genome Resources, and WormBook
- topic-guided reading collections
- inline visual maps of pathway components and regulatory relationships
- links from every featured map to its authoritative source article
- common experimental or conceptual traps for each pathway

Core references include:

- [Insulin/insulin-like growth factor signaling in C. elegans](https://www.ncbi.nlm.nih.gov/books/NBK179230/)
- [Autophagy in C. elegans](https://www.ncbi.nlm.nih.gov/books/NBK116074/)
- [Canonical RTK–Ras–ERK signaling](https://www.ncbi.nlm.nih.gov/books/NBK19739/)
- [Programmed cell death](https://www.ncbi.nlm.nih.gov/books/NBK19668/)
- [Endogenous RNAi pathways](https://www.ncbi.nlm.nih.gov/books/NBK206718/)
- [Wnt signaling](https://www.ncbi.nlm.nih.gov/books/NBK19669/)
- [Notch signaling](https://www.ncbi.nlm.nih.gov/books/NBK19703/)
- [TGF-beta signaling](https://www.ncbi.nlm.nih.gov/books/NBK19692/)
- [Signaling in the innate immune response](https://www.ncbi.nlm.nih.gov/books/NBK19673/)
- [Mitochondrial unfolded protein response review](https://pmc.ncbi.nlm.nih.gov/articles/PMC3867496/)
- [C. elegans as a model for membrane traffic](https://www.ncbi.nlm.nih.gov/books/NBK19650/)
- [The C. elegans intestine](https://www.ncbi.nlm.nih.gov/books/NBK19717/)
- [The sensory cilia of C. elegans](https://www.ncbi.nlm.nih.gov/books/NBK19729/)
- [Germline proliferation and its control](https://www.ncbi.nlm.nih.gov/books/NBK19769/)
- [Epithelial junctions, cytoskeleton, and polarity](https://www.ncbi.nlm.nih.gov/books/NBK19677/)
- [Development and maintenance of body-wall muscle](https://www.ncbi.nlm.nih.gov/books/NBK426064/)

The content is educational and deliberately distinguishes pathway models from what a particular experiment can establish.

## GitHub Pages

GitHub Pages publishes directly from the `main` branch at the repository root. The included `.nojekyll` file tells Pages to serve the static files without Jekyll processing. Future pushes to `main` update the public site automatically.
