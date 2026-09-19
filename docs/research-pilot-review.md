# Compound research pilot — review notes

## Scope
Preview branch only, based on production commit 256e939. No production promotion. The tirzepatide profile, its public snapshot and public comparison use the new record. Creatine and Fadogia are opt-in contrast previews (`?research-preview=1`). Homepage, guides, images, search styling, billing and access rules are unchanged. Navigation label proposed: Research Tools · Pro.

## Diagnosis
Legacy effect scores/counts and imported audit scores/counts are separate datasets rendered together. A missing or narrowly scoped import can display zero next to a legacy positive score. References copied to all effects do not establish claim-level support. The pilot therefore renders a single curated record with explicit claim-source links, nulls for unextracted fields and counters calculated from identified records. Legacy catalogue data are retained for the later migration; no blanket verification was applied.

## Pilot content
Five individually indexed human trial publications and three official documents; targeted selection, not an exhaustive review. Two interactive endpoint comparisons with confidence intervals, keyboard access and a text table. Searchable sources filter by year, study type, outcome and population. Each source states what was actually read. No overall efficacy or safety score. Clinical, preclinical and regulatory statements are distinguished. No reconstitution calculator offered for the commercial medicine.

## Connected actions
Save uses the existing Firebase My Stack ID and quota; unsuccessful persistence rolls back its optimistic state. Anonymous visitors reach signup. Interaction checker receives a validated catalogue ID in its URL. Existing Pro restrictions remain. The semaglutide comparison uses direct trials, with populations/doses kept distinct.

## Verification
- 34 automated tests pass, including source/trial deduplication, provenance, intervals, missing data, interaction selection and existing API access boundaries.
- Build and catalogue schema validation pass; existing scientific review warnings remain for 633 legacy effects.
- No matching credentials found by the repository's secret scan; diff whitespace check passes.
- Browser: source search by PMID returns the expected single paper; mobile graph selection updates the estimate; claim link opens/focuses its exact expanded source; keyboard Home/Enter navigates sections. Mobile tested at 390×844 without horizontal overflow.
- Pro component tested in an explicitly labelled LOCAL ONLY fixture with no account or persistence. This fixture lives only under ignored dist and is not included in Git or Vercel builds.
- Actual authenticated Firebase writes and paid interaction analysis have NOT been exercised against a test account. These remain pre-release checks; no user stack was altered.

## Build prerequisite
The repository's existing bloodwork/optimizer routes import server/groq.js, but that file was absent from Git. Restored the identical existing module from the user's local checkout; this makes the existing access-boundary tests import successfully. No provider requests were made during those tests.

## Remaining limits and migration
The inventory in research-migration.json lists all 394 catalogue records. Tirzepatide is preview-migrated and partially documented; two contrast profiles are partial previews; 391 records are not migrated. Legacy catalogue cards, stack aggregates, AI evidence contexts and the general study comparator still use old data and need a shared-record migration before production release. The new public snapshot/comparison are covered, not every legacy consumer.

Clinical review remains incomplete: abstracts were used where specified; follow-up duration in the CVOT record is not extracted; creatine safety/doses and exhaustive Fadogia human-search screening are not completed. No human benefit or dosing is inferred from animal studies. Additional indications and literature need their own review, not an arbitrary target number of citations.

Before production: obtain validation of this concrete preview; complete authenticated end-to-end checks; migrate remaining tirzepatide consumers; then expand record by record with claim-specific verification. Do not promote this preview as a fully audited catalogue.
