#!/usr/bin/env bash

# ACE Evaluation Service Test Script
# Tests LLM-as-a-Judge, Golden Dataset, and Regression Pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
EVAL_URL="http://localhost:3300"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}ACE Evaluation Service Test Suite${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[1/5] Testing Evaluation Service Health...${NC}"
HEALTH_RESPONSE=$(curl -s "$EVAL_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✓ Evaluation service is healthy${NC}"
else
  echo -e "${RED}✗ Evaluation service health check failed${NC}"
  echo "$HEALTH_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Golden Dataset Metadata
echo -e "${YELLOW}[2/5] Fetching Golden Dataset Metadata...${NC}"
DATASET_RESPONSE=$(curl -s "$EVAL_URL/golden-dataset/v1")
if echo "$DATASET_RESPONSE" | grep -q '"version":"1.0.0"'; then
  echo -e "${GREEN}✓ Golden dataset loaded successfully${NC}"
  echo "  Version: $(echo "$DATASET_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d':' -f2 | tr -d '"')"
  echo "  Total Tests: $(echo "$DATASET_RESPONSE" | grep -o '"totalTests":[0-9]*' | cut -d':' -f2)"
else
  echo -e "${RED}✗ Failed to load golden dataset${NC}"
  echo "$DATASET_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Single Evaluation Request
echo -e "${YELLOW}[3/5] Testing Single Evaluation (Faithfulness)...${NC}"
EVAL_REQUEST='{
  "generatedText": "The Crimson Empire controls the Ruby Mines in the Bloodstone Mountains. Emperor Valen rules the empire and has controlled these mines since 1205.",
  "retrievedContext": "The Crimson Empire, ruled by Emperor Valen, controls the Ruby Mines in the Bloodstone Mountains. Emperor Valen annexed the Ruby Mines in Year 1205.",
  "query": "What resources does the Crimson Empire control?",
  "testCaseId": "test-001"
}'

EVAL_RESPONSE=$(curl -s -X POST "$EVAL_URL/evaluate" \
  -H "Content-Type: application/json" \
  -d "$EVAL_REQUEST")

if echo "$EVAL_RESPONSE" | grep -q '"testCaseId":"test-001"'; then
  FAITHFULNESS=$(echo "$EVAL_RESPONSE" | grep -o '"score":[0-9.]*' | head -1 | cut -d':' -f2)
  PASSED=$(echo "$EVAL_RESPONSE" | grep -o '"passed":[a-z]*' | cut -d':' -f2)

  echo -e "${GREEN}✓ Evaluation completed${NC}"
  echo "  Test Case: test-001"
  echo "  Faithfulness: $FAITHFULNESS"
  echo "  Passed: $PASSED"

  # Check if faithfulness meets threshold
  if (( $(echo "$FAITHFULNESS >= 0.97" | bc -l) )); then
    echo -e "${GREEN}  ✓ Faithfulness score meets ≥0.97 threshold${NC}"
  else
    echo -e "${YELLOW}  ⚠ Faithfulness score below 0.97 threshold${NC}"
  fi
else
  echo -e "${RED}✗ Evaluation request failed${NC}"
  echo "$EVAL_RESPONSE"
fi
echo ""

# Test 4: Hallucination Detection Test
echo -e "${YELLOW}[4/5] Testing Hallucination Detection...${NC}"
HALLUCINATION_REQUEST='{
  "generatedText": "The Crimson Empire controls the Diamond Mines in the Silver Mountains and has nuclear weapons.",
  "retrievedContext": "The Crimson Empire, ruled by Emperor Valen, controls the Ruby Mines in the Bloodstone Mountains.",
  "query": "What resources does the Crimson Empire control?",
  "testCaseId": "test-hallucination"
}'

HALLUCINATION_RESPONSE=$(curl -s -X POST "$EVAL_URL/evaluate" \
  -H "Content-Type: application/json" \
  -d "$HALLUCINATION_REQUEST")

if echo "$HALLUCINATION_RESPONSE" | grep -q '"testCaseId":"test-hallucination"'; then
  FAITH_SCORE=$(echo "$HALLUCINATION_RESPONSE" | grep -o '"score":[0-9.]*' | head -1 | cut -d':' -f2)
  UNGROUNDED=$(echo "$HALLUCINATION_RESPONSE" | grep -o '"ungroundedClaims":[0-9]*' | cut -d':' -f2)

  echo -e "${GREEN}✓ Hallucination detection completed${NC}"
  echo "  Faithfulness: $FAITH_SCORE"
  echo "  Ungrounded Claims: $UNGROUNDED"

  if (( $(echo "$FAITH_SCORE < 0.5" | bc -l) )); then
    echo -e "${GREEN}  ✓ Successfully detected hallucinations (low faithfulness)${NC}"
  else
    echo -e "${YELLOW}  ⚠ Expected lower faithfulness score for hallucinated content${NC}"
  fi
else
  echo -e "${RED}✗ Hallucination detection test failed${NC}"
  echo "$HALLUCINATION_RESPONSE"
fi
echo ""

# Test 5: Regression Test Suite
echo -e "${YELLOW}[5/5] Running Full Regression Test Suite...${NC}"
echo -e "${BLUE}This may take several minutes (10 test cases with LLM evaluation)...${NC}"

REGRESSION_START=$(date +%s)
REGRESSION_RESPONSE=$(curl -s -X POST "$EVAL_URL/regression" \
  -H "Content-Type: application/json" \
  -d '{"version": "v1"}')
REGRESSION_END=$(date +%s)
REGRESSION_DURATION=$((REGRESSION_END - REGRESSION_START))

if echo "$REGRESSION_RESPONSE" | grep -q '"runId"'; then
  TOTAL=$(echo "$REGRESSION_RESPONSE" | grep -o '"totalTests":[0-9]*' | cut -d':' -f2)
  PASSED=$(echo "$REGRESSION_RESPONSE" | grep -o '"passed":[0-9]*' | cut -d':' -f2)
  FAILED=$(echo "$REGRESSION_RESPONSE" | grep -o '"failed":[0-9]*' | cut -d':' -f2)
  AVG_FAITH=$(echo "$REGRESSION_RESPONSE" | grep -o '"averageFaithfulness":[0-9.]*' | cut -d':' -f2)
  AVG_COVERAGE=$(echo "$REGRESSION_RESPONSE" | grep -o '"averageEvidenceCoverage":[0-9.]*' | cut -d':' -f2)
  RECOMMENDATION=$(echo "$REGRESSION_RESPONSE" | grep -o '"recommendation":"[^"]*"' | cut -d':' -f2 | tr -d '"')

  echo -e "${GREEN}✓ Regression test suite completed${NC}"
  echo "  Duration: ${REGRESSION_DURATION}s"
  echo "  Total Tests: $TOTAL"
  echo "  Passed: $PASSED"
  echo "  Failed: $FAILED"
  echo "  Average Faithfulness: $AVG_FAITH"
  echo "  Average Evidence Coverage: $AVG_COVERAGE"
  echo "  Recommendation: $RECOMMENDATION"

  if [ "$RECOMMENDATION" == "PASS" ]; then
    echo -e "${GREEN}  ✓ REGRESSION SUITE PASSED - Ready for deployment${NC}"
  elif [ "$RECOMMENDATION" == "FAIL" ]; then
    echo -e "${RED}  ✗ REGRESSION SUITE FAILED - Do not deploy${NC}"
  else
    echo -e "${YELLOW}  ⚠ REVIEW REQUIRED - Manual inspection needed${NC}"
  fi

  # Check NFR compliance
  if (( $(echo "$AVG_FAITH >= 0.97" | bc -l) )); then
    echo -e "${GREEN}  ✓ Faithfulness NFR met (≥97%)${NC}"
  else
    echo -e "${RED}  ✗ Faithfulness NFR violated (target: ≥97%)${NC}"
  fi
else
  echo -e "${RED}✗ Regression test suite failed${NC}"
  echo "$REGRESSION_RESPONSE"
fi
echo ""

# Final Summary
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Test Suite Complete${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "${GREEN}All evaluation service tests completed!${NC}"
echo ""
echo -e "${YELLOW}API Endpoints Available:${NC}"
echo "  Health:          GET  $EVAL_URL/health"
echo "  Evaluate:        POST $EVAL_URL/evaluate"
echo "  Regression:      POST $EVAL_URL/regression"
echo "  Golden Dataset:  GET  $EVAL_URL/golden-dataset/v1"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review regression report for failed test cases"
echo "  2. Integrate evaluation into CI/CD pipeline as mandatory gate"
echo "  3. Set up continuous monitoring with Prometheus/Grafana"
echo "  4. Configure alerts for Faithfulness < 97% threshold"
