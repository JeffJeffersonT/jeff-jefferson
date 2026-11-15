#!/usr/bin/env bash
# thin wrapper: ./scripts/add-goodie.sh <category> <image-url> [more urls] [--alt ".."] [--href ..] [--credit ".."]
exec python3 "$(dirname "$0")/add-goodie.py" "$@"
