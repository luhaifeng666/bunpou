import { generateVoice } from "./speech.js";
import fs from 'node:fs/promises'
import path from "node:path";
import { fromMarkdown } from 'mdast-util-from-markdown'

const doc = await fs.readFile(path.resolve('docs/bunpou/course1/1-2-1.md'))
const tree = fromMarkdown(doc)

console.log(JSON.stringify(tree))

// 1. 获取所有语法目录
// 2. 获取当前已经存在的语音文件
// 3. 去重 & 生成新的语音文件
