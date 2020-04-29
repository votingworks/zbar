#!/usr/bin/env bash

set -euo pipefail

rm -rf addon/{include,zbar}
for src in $(find ../{include,zbar} -name '*.h' -or -name '*.c'); do
  dst="addon/${src:2}"
  mkdir -p $(dirname "${dst}")
  cp "${src}" "${dst}"
done

rm -rf dist
yarn tsc
rm dist/*.test.*
