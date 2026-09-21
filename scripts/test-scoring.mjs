import assert from "node:assert";

async function runTests() {
  let toeicModule;
  try {
    toeicModule = await import("../src/lib/toeic.ts");
  } catch (err) {
    console.error("FAIL: unable to import src/lib/toeic.ts:", err.message);
    process.exit(1);
  }

  const { calculateToeicScore, generateDiagnostics } = toeicModule;

  // Test 1: Minimum scores
  const minScore = calculateToeicScore(0, 0);
  assert.strictEqual(minScore.listeningScore, 5, "Min listening score should be 5");
  assert.strictEqual(minScore.readingScore, 5, "Min reading score should be 5");
  assert.strictEqual(minScore.totalScore, 10, "Min total score should be 10");

  // Test 2: Maximum scores
  const maxScore = calculateToeicScore(50, 50);
  assert.strictEqual(maxScore.listeningScore, 495, "Max listening score should be 495");
  assert.strictEqual(maxScore.readingScore, 495, "Max reading score should be 495");
  assert.strictEqual(maxScore.totalScore, 990, "Max total score should be 990");

  // Test 3: Intermediate scores
  const midScore = calculateToeicScore(25, 25);
  assert(midScore.listeningScore >= 200 && midScore.listeningScore <= 300, "Mid listening score in range");
  assert(midScore.readingScore >= 200 && midScore.readingScore <= 300, "Mid reading score in range");
  assert.strictEqual(midScore.totalScore, midScore.listeningScore + midScore.readingScore);

  // Test 4: Diagnostics calculation
  const sampleParts = [
    { part: 1, correct: 6, total: 6 }, // 100% strong
    { part: 2, correct: 10, total: 20 }, // 50% weak
    { part: 3, correct: 25, total: 30 }, // ~83% strong
  ];
  const diag = generateDiagnostics(sampleParts);
  assert.strictEqual(diag.length, 3);
  assert.strictEqual(diag[0].status, "strong");
  assert.strictEqual(diag[1].status, "weak");
  assert(typeof diag[1].recommendation === "string" && diag[1].recommendation.length > 0);

  console.log("PASS: all scoring and diagnostic unit tests passed.");
}

runTests();
