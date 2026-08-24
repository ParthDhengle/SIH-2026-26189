from pathlib import Path

# Root = current directory
ROOT = Path.cwd()

# Output file
OUTPUT = ROOT / "FASTAPI_PROJECT_SOURCE.md"

# Folders to completely ignore
EXCLUDED_DIRS = {
    "venv",
    ".venv",
    "env",
    ".env",
    "__pycache__",
    ".git",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
}

# Files to ignore
EXCLUDED_FILES = {
    OUTPUT.name,
}


def should_skip(path: Path) -> bool:
    """Return True if this path should be ignored."""
    return any(part in EXCLUDED_DIRS for part in path.parts)


def collect_python_files():
    """Recursively find all Python files."""
    return sorted(
        path
        for path in ROOT.rglob("*.py")
        if path.is_file()
        and not should_skip(path)
        and path.name not in EXCLUDED_FILES
    )


def create_markdown():
    python_files = collect_python_files()

    with OUTPUT.open("w", encoding="utf-8") as md:
        md.write("# FastAPI Project Source\n\n")
        md.write(
            "This document contains the Python source code of the project. "
            "Files are organized according to their relative paths.\n\n"
        )

        md.write(f"**Project root:** `{ROOT}`\n\n")
        md.write(f"**Python files included:** {len(python_files)}\n\n")
        md.write("---\n\n")

        for file_path in python_files:
            relative_path = file_path.relative_to(ROOT)

            md.write(f"# `{relative_path}`\n\n")
            md.write(f"**File:** `{relative_path}`\n\n")

            try:
                code = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                md.write("> ⚠️ Could not decode this file as UTF-8.\n\n")
                md.write("---\n\n")
                continue

            md.write("```python\n")
            md.write(code)

            # Make sure closing ``` starts on a new line
            if code and not code.endswith("\n"):
                md.write("\n")

            md.write("```\n\n")
            md.write("---\n\n")

    print(f"Created: {OUTPUT}")
    print(f"Python files included: {len(python_files)}")


if __name__ == "__main__":
    create_markdown()