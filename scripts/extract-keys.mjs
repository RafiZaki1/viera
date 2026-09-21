import fs from "fs";
import path from "path";

const markdown = fs.readFileSync(path.resolve("KUNCI-JAWABAN.md"), "utf-8");
const lines = markdown.split(/\r?\n/);

const explanations = {};

for (const rawLine of lines) {
  const line = rawLine.trim();
  const match = line.match(/^\|\s*(\d+)[^|]*\|\s*([ABCD])\s*\|\s*(.*?)\s*\|$/);
  if (match) {
    const num = parseInt(match[1], 10);
    const key = match[2];
    let explanation = match[3].trim();
    // Clean up em-dashes and en-dashes for unslop compliance
    explanation = explanation.replace(/\s*—\s*/g, ". ").replace(/–/g, "-");
    explanations[`q${num}`] = {
      key,
      explanation,
    };
  }
}

console.log(`Parsed ${Object.keys(explanations).length} questions.`);

fs.writeFileSync(
  path.resolve("src/data/explanations.json"),
  JSON.stringify(explanations, null, 2),
  "utf-8"
);
console.log("Written to src/data/explanations.json");
