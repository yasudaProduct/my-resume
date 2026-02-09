#!/usr/bin/env node

import { readFile, writeFile, unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createCipheriv, randomBytes, pbkdf2Sync } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const outDir = join(rootDir, "out");

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

const pdfs = [
  { filename: "履歴書.pdf", encFilename: "resume.pdf.enc" },
  { filename: "職務経歴書.pdf", encFilename: "career.pdf.enc" },
];

async function encryptFile(inputPath, outputPath, password) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");

  const plaintext = await readFile(inputPath);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: [salt (16)][iv (12)][tag (16)][encrypted data]
  const output = Buffer.concat([salt, iv, tag, encrypted]);
  await writeFile(outputPath, output);
}

async function main() {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    console.log("SITE_PASSWORD is not set. Skipping PDF encryption.");
    return;
  }

  console.log("PDFを暗号化中...");

  for (const { filename, encFilename } of pdfs) {
    const inputPath = join(outDir, filename);
    const outputPath = join(outDir, encFilename);

    try {
      await encryptFile(inputPath, outputPath, password);
      await unlink(inputPath);
      console.log(`暗号化完了: ${filename} -> ${encFilename}`);
    } catch (error) {
      console.error(`暗号化失敗 ${filename}:`, error.message);
      process.exit(1);
    }
  }

  console.log("全てのPDF暗号化が完了しました。");
}

main();
