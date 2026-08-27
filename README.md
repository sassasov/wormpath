# WormPath

WormPath is an adaptive, static assessment game for *Caenorhabditis elegans* molecular and cell biology. It mixes gene/function recognition with pathway ordering, topology, perturbation, genetic epistasis, and experimental interpretation.

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

Questions carry a hidden difficulty from 1 (School) to 5 (Professor). A session starts at ability 2.0 (BSc). The next-question selector favors items near the current estimate while adding neighboring difficulties and under-sampled question types/pathways. Two strong answers increase the probability of a harder item; repeated weak answers shift that probability downward.

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

Structured gene records live in [`data/genes.js`](data/genes.js), separately from question and UI logic. Each record includes pathway, molecular function, processes, localization, regulatory context, interaction type, phenotypes, orthologs, difficulty, explanation, and reference IDs. Safe recognition questions are generated from those records. Epistasis and experimental-interpretation questions are curated explicitly in [`data/curatedQuestions.js`](data/curatedQuestions.js).

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

The content is educational and deliberately distinguishes pathway models from what a particular experiment can establish.

## GitHub Pages

GitHub Pages publishes directly from the `main` branch at the repository root. The included `.nojekyll` file tells Pages to serve the static files without Jekyll processing. Future pushes to `main` update the public site automatically.
