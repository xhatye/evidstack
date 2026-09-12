# Scientific content audit

Audit run: 13 September 2026.

This pass reviewed all 394 compound fiches and all 733 effect records, including the 633 effects that had no attached reference at the start of the pass.

## Scope and method

- Existing PMID references were checked through NCBI PubMed E-utilities. All 118 unique attached PMIDs resolved; no missing PMID or malformed non-PMID reference remains.
- The 633 uncited effects were searched against Europe PMC using the compound name, goal terms and human-study filters. Candidate titles were retained in `scientific-source-repair.json` for review.
- A candidate was not attached automatically when the title did not clearly support the exact compound and effect. This avoids replacing an unsupported claim with a plausible but unrelated paper.

## Result

- 394 compounds and 733 effects are present in the catalogue.
- 100 effects have attached references selected by the existing audit; 633 remain explicitly marked `needs-review` and are shown as unestablished in the product.
- The fresh search produced four possible matches, but none met the strict exact-compound and outcome threshold for automatic attachment. No speculative PMID was added.
- The Retatrutide correction remains linked to PMID 37366315; the unrelated PMID 37557886 is not used.

## Interpretation

“No verified reference attached” means the catalogue does not currently have a source that passed the matching rules. It is not evidence that the effect is absent. Scores and summaries are editorial research context, not clinical recommendations.

The remaining 633 records need a human evidence review against abstracts or full text: population, intervention, dose, duration, outcomes, adverse effects and limitations. Until that review is complete, they should remain labelled as unestablished.

