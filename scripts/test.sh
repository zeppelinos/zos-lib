# Exit script as soon as a command fails.
set -o errexit

run_lib_tests() {
  echo "Testing root project..."
  npx truffle compile
  npx truffle test "$@"
}

run_example_tests() {
  echo "Testing examples..."
  npm run prepack
  cd examples/complex
  npm i
  npm test
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
  echo "Measuring coverage..."
  npx solidity-coverage
  if [ "$CONTINUOUS_INTEGRATION" = true ]; then
    cat coverage/lcov.info | npx coveralls
  fi
else
  run_lib_tests && run_example_tests
fi
