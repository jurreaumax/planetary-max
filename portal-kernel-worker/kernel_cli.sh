#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$script_dir/../scripts/build_kernel_worker.sh" "$script_dir/.kernel-dist"
cd "$script_dir"
exec uv run pywrangler "$@"
