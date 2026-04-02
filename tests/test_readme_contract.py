from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_readme_documents_verified_shell_and_harness_entrypoints():
    readme_text = (REPO_ROOT / "README.md").read_text(encoding="utf-8")

    for expected_fragment in [
        "Jakal Workspace Desktop",
        "projects",
        "tasks",
        "ideas",
        "files",
        "config/profiles/jakal-flow-local.json",
        "config/profiles/sample-local.json",
        "python -m pytest",
        "npm run build",
        "scripts/check-prereqs.ps1",
        "scripts/materialize-target.ps1 -ProfileId sample-local",
        "scripts/invoke-verification.ps1",
        "scripts/clean-local-state.ps1",
        "Verified Closeout Checks",
    ]:
        assert expected_fragment in readme_text
