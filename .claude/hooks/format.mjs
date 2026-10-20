// PostToolUse hook: Claude가 수정한 파일에 Prettier를 자동 적용한다.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname } from "node:path";

const FORMATTABLE = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".css",
  ".md",
  ".yml",
]);

let input = "";
for await (const chunk of process.stdin) input += chunk;

try {
  const filePath = JSON.parse(input).tool_input?.file_path;
  if (filePath && FORMATTABLE.has(extname(filePath)) && existsSync(filePath)) {
    execFileSync("npx", ["prettier", "--write", filePath], {
      stdio: "ignore",
      shell: true,
    });
  }
} catch {
  // 포맷 실패가 Claude의 작업을 막지 않도록 무시한다.
}
