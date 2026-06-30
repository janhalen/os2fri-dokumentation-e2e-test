#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-beslutningslog}"
PASS=0
FAIL=0

test_entry() {
  local name="$1"
  local issue_number="$2"
  local issue_title="$3"
  local issue_labels="$4"
  local issue_closed_at="$5"
  local body_file="$6"
  local expected_file="$7"

  local tmp_out="tests/out/decision-${issue_number}-$(date +%s).md"

  if ! podman run --rm \
    -v "$(pwd):/repo:z" \
    -e ISSUE_NUMBER="$issue_number" \
    -e ISSUE_TITLE="$issue_title" \
    -e ISSUE_LABELS="$issue_labels" \
    -e ISSUE_CLOSED_AT="$issue_closed_at" \
    -e "ISSUE_BODY=$(cat "$body_file")" \
    -e ISSUE_URL="https://example.org/issues/$issue_number" \
    -e OUTPUT_LOG="/repo/$tmp_out" \
    "$IMAGE" 2>/dev/null; then
    echo "FAIL: $name (exit code non-zero)"
    rm -f "$tmp_out"
    FAIL=$((FAIL + 1))
    return
  fi

  if ! diff -q "$tmp_out" "$expected_file" >/dev/null 2>&1; then
    echo "FAIL: $name (output mismatch)"
    echo "--- got ---"
    cat "$tmp_out"
    echo "--- expected ---"
    cat "$expected_file"
    rm -f "$tmp_out"
    FAIL=$((FAIL + 1))
    return
  fi

  echo "PASS: $name"
  rm -f "$tmp_out"
  PASS=$((PASS + 1))
}

cd "$(dirname "$0")/.."

echo "=== beslutningslog tests ==="
echo ""

# Test 1: happy path
test_entry \
  "basic entry" \
  "42" \
  "Test: Simuleret beslutning om grønne markører" \
  "Beslutning, test" \
  "2026-06-30T12:00:00Z" \
  "tests/fixtures/42-body.md" \
  "tests/expected/42-entry.md"

echo ""
echo "=== results: $PASS passed, $FAIL failed ==="
exit $FAIL
