import { generateVoice } from "./speech.js";
import path from "node:path";
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'

// 1. 获取所有语法目录
// 2. 获取当前已经存在的语音文件
// 3. 去重 & 生成新的语音文件

/**
 * 获取文件中所有的日语句子
 * @param {*} path 文件路径
 */
const getAllSentences = async (dir) => {
    const doc = await fs.readFile(path.resolve(`docs/${dir}`))
    const tree = fromMarkdown(doc)

    console.log(JSON.stringify(tree))
}

getAllSentences("bunpou/course1/1-2-1.md")
