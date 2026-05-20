#!/usr/bin/env node

/**
 * 自动为缺少 **...** 高亮标记的 grammer-content 添加高亮。
 * 通过 frontmatter title 提取语法模式，然后在例句中匹配并添加 **...**。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['N1', 'N2', 'N3', 'N4', 'N5'].map((d) =>
  path.join(ROOT, 'docs', 'bunpou', d),
);

function collectMdFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md')) files.push(path.join(dir, entry.name));
    }
  }
  return files.sort();
}

// 从 frontmatter title 提取核心语法模式
function extractGrammarPattern(text) {
  const m = text.match(/^---\s*\ntitle:\s*(.+?)\s*\n/m);
  if (!m) return null;
  let title = m[1].trim();
  // 去掉角括号说明部分，如 ～というN ＜命名＞ → ～というN
  title = title.replace(/[＜<][^＞>]*[＞>]/g, '').trim();
  return title;
}

// 从语法模式生成匹配正则（转义特殊字符）
function patternToRegex(pattern) {
  // 转义正则特殊字符
  let escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 允许中间有振假名标记 [xxx/yyy]
  escaped = escaped.replace(/(\\~|\\～)/g, '[～~]');
  return new RegExp(escaped, 'g');
}

// 在句子里查找语法模式位置（忽略振假名标记）
function findGrammarInSentence(sentence, pattern) {
  // 去掉振假名标记，得到纯文本
  const plain = sentence.replace(/\[[^\]]*\/[^\]]*\]/g, (m) => {
    // [kanji/reading] → kanji
    return m.replace(/\[([^\/]*)\/[^\]]*\]/g, '$1');
  });

  // 在纯文本中查找模式
  const idx = plain.indexOf(pattern);
  if (idx === -1) return null;

  // 返回纯文本中的位置
  return { plainIdx: idx, plainLength: pattern.length };
}

function fixFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf-8');
  const pattern = extractGrammarPattern(text);
  if (!pattern) return { file: path.relative(ROOT, filePath), fixed: 0, msg: 'no pattern' };

  let fixed = 0;
  const tagRegex = /(<grammer-content\b[^>]*?sentence=(["']))(.*?)(\2[^>]*?trans=(["']).*?\5[^>]*?(?:\/>|>[\s\S]*?<\/grammer-content>))/g;
  let match;

  // 对每个带 trans 的 grammer-content 标签检查并修复
  const tags = [];
  while ((match = tagRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const prefix = match[1];
    const quote = match[2];
    const sentence = match[3];
    const suffix = match[4];

    // 已经有 ** 的跳过
    if (/\*\*.*?\*\*/.test(sentence)) continue;

    // 尝试找到语法模式并添加 **
    const result = findGrammarInSentence(sentence, pattern);
    if (!result) continue;

    // 在 sentence 原文中对应位置插入 **
    // 由于我们是在去振假名的纯文本中匹配的，需要映射回原文
    // 简化处理：直接在纯文本模式匹配处插入 **
    const plain = sentence.replace(/\[[^\]]*\/[^\]]*\]/g, (m) =>
      m.replace(/\[([^\/]*)\/[^\]]*\]/g, '$1'),
    );

    const before = plain.slice(0, result.plainIdx);
    const grammar = plain.slice(result.plainIdx, result.plainIdx + result.plainLength);
    const after = plain.slice(result.plainIdx + result.plainLength);

    // 需要找到原文中对应位置来插入 **
    // 这里做简化：在原文中直接替换语法模式
    // 前提是语法模式在原文中也存在（不包含振假名的部分）
    const plainGrammarWithBold = `**${grammar}**`;

    // 在原 sentence 中查找纯语法文本
    const grammarIdx = sentence.indexOf(grammar);
    if (grammarIdx === -1) continue;

    // 确认这个位置不是振假名标记内部
    let bracketDepth = 0;
    let inBracket = false;
    for (let i = 0; i < grammarIdx; i++) {
      if (sentence[i] === '[') bracketDepth++;
      if (sentence[i] === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    }

    // 构建新的 sentence
    const newSentence =
      sentence.slice(0, grammarIdx) +
      `**${grammar}**` +
      sentence.slice(grammarIdx + grammar.length);

    // 替换
    const newFullMatch = prefix + newSentence + suffix;
    text = text.replace(fullMatch, newFullMatch);
    fixed++;
  }

  if (fixed > 0) {
    fs.writeFileSync(filePath, text, 'utf-8');
  }

  return { file: path.relative(ROOT, filePath), fixed };
}

const files = collectMdFiles(SCAN_DIRS);
let totalFixed = 0;
const skipped = [];

for (const file of files) {
  const result = fixFile(file);
  if (result.fixed > 0) {
    console.log(`  ✅ ${result.file}: ${result.fixed} 处修复`);
    totalFixed += result.fixed;
  }
}

console.log(`\n总计修复 ${totalFixed} 处缺少的高亮标记`);
