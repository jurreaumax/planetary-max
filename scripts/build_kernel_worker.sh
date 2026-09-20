#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repository_root="$(cd "$script_dir/.." && pwd)"
build_root="${1:-$repository_root/.kernel-dist}"
if [[ "$build_root" != /* ]]; then
  build_root="$(pwd)/$build_root"
fi
case "$build_root" in
  "$repository_root/.kernel-dist"|"$repository_root/portal-kernel-worker/.kernel-dist") ;;
  *)
    echo "Refusing to replace unexpected kernel build directory: $build_root" >&2
    exit 2
    ;;
esac

rm -rf "$build_root"
mkdir -p "$build_root"
cp "$repository_root/kernel_worker.py" "$build_root/kernel_worker.py"

(
  cd "$repository_root"
  for source_dir in cognitive governance identity kernel maxos_bridge routing substrate tec; do
    find "$source_dir" -type f -name '*.py' -exec cp --parents '{}' "$build_root" \;
  done
)
