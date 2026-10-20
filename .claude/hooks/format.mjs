// PostToolUse hook: Claude가 수정한 파일에 Prettier를 자동 적용한다.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
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
  const filePath = JSON.parse(input.replace(/^﻿/, "")).tool_input?.file_path;
  if (filePath && FORMATTABLE.has(extname(filePath)) && existsSync(filePath)) {
    // 셸/PATH 해석에 의존하지 않도록 현재 node로 prettier CLI를 직접 실행한다.
    const prettierBin = createRequire(import.meta.url).resolve(
      "prettier/bin/prettier.cjs",
    );
    execFileSync(process.execPath, [prettierBin, "--write", filePath], {
      stdio: "ignore",
    });
  }
} catch (error) {
  // 포맷 실패가 Claude의 작업을 막지 않도록 stderr에만 남긴다.
  console.error(`[format hook] ${error.message}`);
}
