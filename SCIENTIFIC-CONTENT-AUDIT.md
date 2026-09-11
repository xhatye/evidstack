# Scientific content audit

This audit covers the current Evidstack catalogue as of September 2026.

## Scope and method

- 394 compounds and 733 effect records were loaded directly from `src/data.js`.
- PubMed references were extracted and checked through NCBI E-utilities.
- The audit checks that a PMID resolves and records its title and publication date. A resolving PMID is not, by itself, proof that the paper supports the summary; relevance still needs a human review.
- Claims were changed only where a mismatch was confirmed from the source record.

## Corrections in this tranche

- Magnesium bisglycinate sleep, mood, focus and recovery claims were made narrower where the cited records did not support the original wording.
- Vitamin D3 + K2 testosterone and longevity claims were separated from unsupported combination or mortality claims.
- Creatine strength wording was changed from an absolute claim to a training- and population-dependent summary.
- Omega-3 cardiovascular wording now distinguishes prescription icosapent ethyl from general fish-oil products.
- Melatonin wording now reflects modest, population-dependent sleep effects and circadian use.
- PQQ wording now describes small cognition and biomarker trials as preliminary for general energy claims.
- The malformed PQQ reference and non-PubMed placeholders were removed from the catalogue.
- The obsolete `strength` goal key was migrated to `force`; `endurance` was added to the public goal taxonomy.

## Current coverage

- 367 unique PMID references resolve through PubMed.
- No malformed non-PMID references remain in the catalogue after normalization.
- 379 effects have no attached source and are now marked in the compound view as unestablished pending review.

## Remaining work

The remaining 379 uncited effects and the relevance of the 367 resolved PMIDs require batch review against the full text or abstract, including population, intervention, dose, outcome, duration and limitations. Until that work is complete, scores and summaries are editorial research context, not clinical recommendations.

