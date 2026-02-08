#!/usr/bin/env node

import puppeteer from "puppeteer";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdir, access, copyFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = join(rootDir, "out");
const PUBLIC_DIR = join(rootDir, "public");

// 静的ファイルモードかどうか（ビルド後のoutディレクトリを配信）
const STATIC_MODE = process.env.STATIC_MODE === "true";
// GitHub Pagesのベースパス
const BASE_PATH = process.env.BASE_PATH || "";

// PDF生成設定
const pages = [
  { path: "/print/resume", filename: "履歴書.pdf" },
  { path: "/print/career", filename: "職務経歴書.pdf" },
];

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`サーバーが起動しました: ${url}`);
        return true;
      }
    } catch {
      // サーバーがまだ起動していない
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`サーバーが起動しませんでした: ${url}`);
}

async function generatePdf(browser, pagePath, outputPath) {
  const page = await browser.newPage();
  const url = `${BASE_URL}${pagePath}`;

  console.log(`PDFを生成中: ${url} -> ${outputPath}`);

  await page.goto(url, { waitUntil: "networkidle0" });

  // フォントの読み込みを待つ
  await page.evaluateHandle("document.fonts.ready");

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  await page.close();
  console.log(`PDF生成完了: ${outputPath}`);
}

async function startStaticServer() {
  console.log("静的サーバーを起動中...");

  // npx serveを使用して静的ファイルを配信
  const server = spawn("npx", ["serve", "out", "-l", PORT.toString()], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  server.stdout.on("data", (data) => {
    const output = data.toString();
    if (process.env.DEBUG) {
      console.log(`[server] ${output}`);
    }
  });

  server.stderr.on("data", (data) => {
    const output = data.toString();
    if (process.env.DEBUG) {
      console.error(`[server] ${output}`);
    }
  });

  return server;
}

async function startDevServer() {
  console.log("開発サーバーを起動中...");

  const server = spawn("npm", ["run", "dev"], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  server.stdout.on("data", (data) => {
    const output = data.toString();
    if (process.env.DEBUG) {
      console.log(`[server] ${output}`);
    }
  });

  server.stderr.on("data", (data) => {
    const output = data.toString();
    if (process.env.DEBUG) {
      console.error(`[server] ${output}`);
    }
  });

  return server;
}

async function main() {
  let server = null;
  let browser = null;

  try {
    // 出力ディレクトリを作成
    await mkdir(OUTPUT_DIR, { recursive: true });

    // サーバーを起動（既存のサーバーがなければ）
    const startOwnServer = process.env.USE_EXISTING_SERVER !== "true";

    if (startOwnServer) {
      if (STATIC_MODE) {
        // 静的ファイルモード: ビルド済みのoutディレクトリを配信
        try {
          await access(join(rootDir, "out", "index.html"));
        } catch {
          console.error("エラー: outディレクトリが存在しません。先にnpm run buildを実行してください。");
          process.exit(1);
        }
        server = await startStaticServer();
      } else {
        // 開発モード: 開発サーバーを起動
        server = await startDevServer();
      }
    }

    // サーバーが起動するまで待機
    await waitForServer(BASE_URL);

    // Puppeteerを起動
    console.log("ブラウザを起動中...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
    });

    // 各ページのPDFを生成
    for (const { path, filename } of pages) {
      const fullPath = BASE_PATH + path;
      const outputPath = join(OUTPUT_DIR, filename);
      await generatePdf(browser, fullPath, outputPath);
    }

    // 開発モードの場合、publicフォルダにもコピー（開発サーバーで配信するため）
    if (!STATIC_MODE) {
      console.log("\npublicフォルダにPDFをコピー中...");
      await mkdir(PUBLIC_DIR, { recursive: true });
      for (const { filename } of pages) {
        const src = join(OUTPUT_DIR, filename);
        const dest = join(PUBLIC_DIR, filename);
        await copyFile(src, dest);
        console.log(`コピー完了: ${dest}`);
      }
    }

    console.log("\n全てのPDF生成が完了しました！");
    console.log(`出力先: ${OUTPUT_DIR}`);
    if (!STATIC_MODE) {
      console.log(`開発用コピー先: ${PUBLIC_DIR}`);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      // サーバープロセスを強制終了
      server.kill("SIGKILL");
    }
    // 明示的にプロセスを終了
    process.exit(0);
  }
}

main();
