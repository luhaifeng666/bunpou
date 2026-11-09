#!/usr/bin/env node

/**
 * 内容格式 Lint 工具（Harness Engineering）
 *
 * 检查项：
 * 1. 振假名格式 [kanji/reading] 是否正确闭合
 * 2. **...** 语法高亮标记是否成对
 * 3. frontmatter title / 正文标题中的繁体中文
 * 4. <grammer-content> 组件格式完整性
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const SCAN_DIRS = ['N1', 'N2', 'N3', 'N4', 'N5'].map((d) =>
  path.join(ROOT, 'docs', 'bunpou', d),
);

// ── 繁体→简体 对照表（日语教材场景常见字） ──
const TRAD_TO_SIMP = {
  説: '说',
  強: '强',
  為: '为',
  時: '时',
  來: '来',
  動: '动',
  爾: '尔',
  寫: '写',
  學: '学',
  實: '实',
  體: '体',
  點: '点',
  會: '会',
  過: '过',
  個: '个',
  對: '对',
  還: '还',
  沒: '没',
  現: '现',
  樣: '样',
  經: '经',
  網: '网',
  語: '语',
  話: '话',
  讓: '让',
  問: '问',
  間: '间',
  關: '关',
  開: '开',
  門: '门',
  愛: '爱',
  這: '这',
  見: '见',
  書: '书',
  長: '长',
  當: '当',
  後: '后',
  從: '从',
  頭: '头',
  無: '无',
  變: '变',
  電: '电',
  風: '风',
  萬: '万',
  與: '与',
  氣: '气',
  進: '进',
  業: '业',
  義: '义',
  樂: '乐',
  發: '发',
  裡: '里',
  麵: '面',
  應: '应',
  處: '处',
  號: '号',
  術: '术',
  衛: '卫',
  裏: '里',
  妳: '你',
  彆: '别',
  儘: '尽',
  佔: '占',
  佈: '布',
  採: '采',
  綵: '彩',
  齣: '出',
  糰: '团',
  闆: '板',
  鍾: '钟',
  誌: '志',
  颳: '刮',
  菸: '烟',
  臺: '台',
  睏: '困',
  慾: '欲',
  洩: '泄',
  瀰: '弥',
  蹟: '迹',
  屍: '尸',
  捨: '舍',
  昇: '升',
  濛: '蒙',
  矇: '蒙',
  懞: '蒙',
  慄: '栗',
  國際: '国际',
  實際: '实际',
  歷史: '历史',
  簡單: '简单',
  結果: '结果',
  經常: '经常',
  開始: '开始',
  學習: '学习',
  問題: '问题',
  東西: '东西',
  沒有: '没有',
  認識: '认识',
  電腦: '电脑',
  電話: '电话',
  電影: '电影',
  關係: '关系',
  覺得: '觉得',
  聯繫: '联系',
  說明: '说明',
  記憶: '记忆',
  繼續: '继续',
  選擇: '选择',
  錯誤: '错误',
  標準: '标准',
  參考: '参考',
  怎麼樣: '怎么样',
  為什麼: '为什么',
  怎麼辦: '怎么办',
};

const TRAD_ENTRIES = Object.entries(TRAD_TO_SIMP).sort(
  (a, b) => b[0].length - a[0].length,
);

const errors = [];

// ── 工具函数 ──

function collectMdFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(path.join(dir, entry.name));
      }
    }
  }
  return files.sort();
}

function rel(filePath) {
  const idx = filePath.indexOf('docs/');
  return idx !== -1 ? filePath.slice(idx) : path.relative(ROOT, filePath);
}

function addError(file, line, msg) {
  errors.push({ file: rel(file), line, msg });
}

// ── 1. 振假名格式检查 ──

function checkFurigana(file, text) {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    let pos = 0;
    while (pos < line.length) {
      const open = line.indexOf('[', pos);
      if (open === -1) break;

      const close = line.indexOf(']', open + 1);
      if (close === -1) {
        const snippet = line.slice(open + 1, open + 25);
        addError(file, lineNo, `振假名格式错误: 方括号未闭合 "[${snippet}..."`);
        pos = open + 1;
        continue;
      }

      const content = line.slice(open + 1, close);

      if (content.length === 0) {
        pos = close + 1;
        continue;
      }

      if (content.includes('[')) {
        addError(
          file,
          lineNo,
          `振假名格式错误: 存在嵌套方括号 "[${content.slice(0, 30)}]"`,
        );
        pos = close + 1;
        continue;
      }

      if (content.includes('/')) {
        const slashIdx = content.indexOf('/');

        if (slashIdx === 0) {
          addError(
            file,
            lineNo,
            `振假名格式错误: "/" 前缺少内容 "[${content}]"`,
          );
        } else if (slashIdx === content.length - 1) {
          addError(
            file,
            lineNo,
            `振假名格式错误: "/" 后缺少读音 "[${content}]"`,
          );
        } else {
          const reading = content.slice(slashIdx + 1);
          const hasKana = /[぀-ゟ゠-ヿ]/.test(reading);
          if (!hasKana) {
            addError(
              file,
              lineNo,
              `振假名格式错误: "/" 后应为假名读音 "[${content}]"`,
            );
          }
        }
      }

      pos = close + 1;
    }

    // 检查孤立的 ]
    let openCount = 0;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '[' && (j === 0 || line[j - 1] !== '\\')) {
        openCount++;
      } else if (line[j] === ']' && (j === 0 || line[j - 1] !== '\\')) {
        if (openCount === 0) {
          addError(
            file,
            lineNo,
            `振假名格式错误: 多余的 "]" (缺少对应的 "[")`,
          );
        } else {
          openCount--;
        }
      }
    }
  }
}

// ── 2. 语法高亮标记检查 ──

function checkHighlightMarkers(file, text) {
  // 提取所有 grammer-content 的 sentence 属性值并检查 ** 成对
  const sentenceRegex = /sentence=(["'])(.*?)\1/g;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentenceValue = match[2];
    const starCount = (sentenceValue.match(/\*\*/g) || []).length;
    if (starCount % 2 !== 0) {
      const beforeMatch = text.slice(0, match.index);
      const lineNo = beforeMatch.split('\n').length;
      addError(
        file,
        lineNo,
        `语法高亮未闭合: sentence 属性中 ** 标记不成对 (${starCount} 个)`,
      );
    }
  }
}

// ── 3. 繁体中文检查 ──

function checkTraditionalChinese(file, text) {
  const lines = text.split('\n');
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    if (i === 0 && line.trim() === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && line.trim() === '---') {
      inFrontmatter = false;
      continue;
    }

    const isFrontmatterTitle = inFrontmatter && /^\s*title:\s*(.+)/.test(line);
    const isHeading = !inFrontmatter && /^#\s+(.+)/.test(line);

    if (!isFrontmatterTitle && !isHeading) continue;

    const textToCheck = isFrontmatterTitle
      ? line.match(/^\s*title:\s*(.+)/)[1]
      : line.match(/^#\s+(.+)/)[1];

    const found = [];
    // 「を問わず」中的「問」是日语用字。
    let remaining = textToCheck.replaceAll('を問わず', 'をとわず');

    while (remaining.length > 0) {
      let matched = false;
      for (const [trad, simp] of TRAD_ENTRIES) {
        const idx = remaining.indexOf(trad);
        if (idx !== -1) {
          found.push(`${trad}→${simp}`);
          remaining = remaining.slice(idx + trad.length);
          matched = true;
          break;
        }
      }
      if (!matched) break;
    }

    if (found.length > 0) {
      const label = isFrontmatterTitle ? 'frontmatter title' : '标题';
      addError(file, lineNo, `繁体字 (${label}): ${found.join(', ')}`);
    }
  }
}

// ── 4. grammer-content 组件格式检查 ──

function checkGrammerContent(file, text) {
  const tagRegex =
    /<grammer-content\b([^>]*?)(\/>|>[\s\S]*?<\/grammer-content>)/g;
  let match;

  const tags = [];
  while ((match = tagRegex.exec(text)) !== null) {
    const attrs = match[1];
    const beforeTag = text.slice(0, match.index);
    const lineNo = beforeTag.split('\n').length;
    tags.push({ attrs, lineNo });
  }

  for (const tag of tags) {
    const { attrs, lineNo } = tag;

    // 检查 sentence 属性
    const hasSentence = /\bsentence\s*=\s*(["'])/.test(attrs);
    if (!hasSentence) {
      addError(file, lineNo, 'grammer-content 组件缺少 sentence 属性');
      continue;
    }

    // 提取 sentence 属性值
    const sentenceMatch = attrs.match(/\bsentence\s*=\s*(["'])(.*?)\1/);
    if (!sentenceMatch) continue;

    const sentenceValue = sentenceMatch[2];

    // 检查 ** 成对
    const starCount = (sentenceValue.match(/\*\*/g) || []).length;
    if (starCount % 2 !== 0) {
      addError(
        file,
        lineNo,
        `grammer-content sentence 中 ** 标记不成对 (${starCount} 个)`,
      );
    }

    // 只有带 trans 属性的（例句）才需要 **...** 高亮标记
    const hasTrans = /\btrans\s*=\s*(["'])/.test(attrs);
    if (hasTrans) {
      const hasHighlight = /\*\*.*?\*\*/.test(sentenceValue);
      if (!hasHighlight) {
        addError(
          file,
          lineNo,
          'grammer-content sentence 中缺少 **...** 高亮标记',
        );
      }
    }
  }
}

// ── 主流程 ──

function lintFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');

  checkFurigana(filePath, text);
  checkHighlightMarkers(filePath, text);
  checkTraditionalChinese(filePath, text);
  checkGrammerContent(filePath, text);
}

const files = collectMdFiles(SCAN_DIRS);

if (files.length === 0) {
  console.log('⚠️  未找到 .md 文件，跳过 Lint。');
  process.exit(0);
}

for (const file of files) {
  lintFile(file);
}

// ── 输出 ──

if (errors.length === 0) {
  console.log(`✅ 扫描完成: ${files.length} 文件, 0 错误`);
  process.exit(0);
}

for (const err of errors) {
  console.log(`❌ ${err.file}:${err.line} - ${err.msg}`);
}

console.log(`\n✅ 扫描完成: ${files.length} 文件, ${errors.length} 错误`);
process.exit(1);
