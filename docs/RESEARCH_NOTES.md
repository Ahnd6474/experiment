# Research Notes

- 2026-04-01: `python -m pytest` failed on `tests/test_harness_contract.py::test_gitignore_keeps_local_state_untracked` because `.gitignore` did not include `.local/`.
- Added the missing `.local/` ignore rule to satisfy the repository contract; no route code change was required for this failure.
