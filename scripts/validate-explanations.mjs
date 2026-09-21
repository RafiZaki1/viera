import fs from "fs";
import path from "path";

const explanationsPath = path.resolve("src/data/explanations.json");
const testDataPath = path.resolve("src/data/test.json");

if (!fs.existsSync(explanationsPath)) {
  console.error("FAIL: src/data/explanations.json does not exist");
  process.exit(1);
}

const rawTest = JSON.parse(fs.readFileSync(testDataPath, "utf-8"));
const explanations = JSON.parse(fs.readFileSync(explanationsPath, "utf-8"));

const questions = rawTest.filter((item) => item.type !== "direction");

if (questions.length !== 100) {
  console.error(`FAIL: expected 100 questions in test.json, found ${questions.length}`);
  process.exit(1);
}

let errors = 0;
for (let i = 1; i <= 100; i++) {
  const id = `q${i}`;
  const exp = explanations[id];
  const q = questions.find((item) => item.id === id);

  if (!exp) {
    console.error(`FAIL: missing explanation for ${id}`);
    errors++;
    continue;
  }

  if (!exp.key || !["A", "B", "C", "D"].includes(exp.key)) {
    console.error(`FAIL: invalid key '${exp.key}' for ${id}`);
    errors++;
  }

  if (q && q.answer && exp.key !== q.answer) {
    console.error(`FAIL: key mismatch for ${id}. test.json=${q.answer}, explanations=${exp.key}`);
    errors++;
  }

  if (!exp.explanation || typeof exp.explanation !== "string" || exp.explanation.trim().length === 0) {
    console.error(`FAIL: empty explanation for ${id}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log("PASS: all 100 questions have valid explanations matching test.json keys.");
