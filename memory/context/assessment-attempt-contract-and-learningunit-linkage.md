# Context: Assessment Attempt Contract and LearningUnit Linkage

**Category:** Technical
**Created:** 2026-02-13
**Last Updated:** 2026-02-13
**Tags:** #context #assessment #learning-unit #api-contract #rest

## Overview

Learner assessments now follow a canonical identity model where attempts are owned by `assessmentId`. Learning units still matter, but only as launch/provenance context.

## Key Points

- Canonical path for graded exercises/assessments:
  - `CanonicalCourse -> Course -> Module -> LearningUnit -> Questions`
- For assessment learning units, `learningUnit.contentId` should contain `Assessment._id`.
- Attempt APIs should be anchored to `assessmentId`; `learningUnitId` is optional context metadata.
- Product-owner direction on 2026-02-13: no compatibility window; prioritize ideal route structure, REST semantics, and optimization over legacy compatibility.

## Details

- Source-of-truth comm to frontend confirms that `assessmentId` is the authoritative attempt identity and legacy exam-attempt contract should not be used for new implementation.
- UI launch flow should resolve the assessment via `learningUnit.contentId`, then call canonical attempt routes under `/assessments/:assessmentId/attempts/...`.
- Course player should not create content attempts for assessment units; it should route learner to the assessment attempt flow.

## Implications

- New learner assessment implementation must avoid legacy `exam-attempts` endpoints.
- Test fixtures and MSW mocks must use canonical assessment-attempt routes and include required launch context (`enrollmentId`, optional `learningUnitId`).
- Any stale path that treats assessment completion as generic content progression should be removed or isolated behind explicit non-assessment logic.

## Related Context

- [[project-overview]]

## Links

- [[../sessions/2026-02-13-assessment-attempt-canonicalization-handoff]]
- [[../memory-log]]
