import { generateVoice } from "./speech.js";
import path from "node:path";
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'

// 1. 获取所有语法目录
// 2. 获取当前已经存在的语音文件
// 3. 去重 & 生成新的语音文件

// 所有markdown文件
const allFiles = [];

// 复制目录结构
const copyDirectories = async () => {
    await fs.cp(path.resolve('docs'), path.resolve('public/voices'), {
        recursive: true,
        force: false,
        filter: (src) => {
            const isMDFile = src.endsWith('.md');
            isMDFile && allFiles.push(src);
            return !isMDFile;
        }
    })
}

/**
 * 获取文件中所有的日语句子
 * @param {*} path 文件路径
 */
const getAllSentences = async (dir) => {
    const doc = await fs.readFile(dir)
    const tree = fromMarkdown(doc)
    const docTitle = tree.children[1].children[0].value;

    // 移除 thematicBreak + 第一个heading
    tree.children.splice(0, 2);

    // 写入ID

    // console.log(JSON.stringify(tree))
    console.log(`---\n${docTitle}\n---\n${toMarkdown(tree)}\n`)
}

await copyDirectories()
getAllSentences(allFiles[0])
