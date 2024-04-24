import { generateVoice } from "./speech.js";
import path from "node:path";
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'

const BASE_URL = path.resolve('docs');

// 获取所有文件
const getAllDocs = async (fn, pathName = "docs") => {
    const files = await fs.readdir(path.resolve(pathName), {
        recursive: true
    })
    return files.filter(fn)
}

/**
 * 设置Id
 * @param {*} tree
 * @param {*} fileBaseName 
 */
const setId = (tree, fileBaseName) => {
    let count = 0;
    return tree.replace(/(grammer-content)(.*?\/>)/gi, (data, str1, str2) => {
        if (!data.includes("trans")) {
            return data
        } else {
            const str = `${str1} id='${fileBaseName}-${count}'${str2}`
            count += 1
            return str
        }
    })
}

/**
 * 获取文件中所有的日语句子
 * @param {*} path 文件路径
 */
const getAllSentences = (tree) => (tree
    .match(/(grammer-content)(.*?\/>)/gi) || [])
    .filter(sentence => sentence.includes('trans'))
    .map(
        sentence => sentence.replace(/\[([^\[]*)\/([\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]*)\]/g, (word) => {
            const [rb, rt] = word.replace(/\[|\]/g, "").split("/");
            return rb;
        }).replace(/\*\*(.*?)\*\*/g, '$1').replace(/.*sentence=\\"(.*?)\\".*/g, "$1")
    )

// 设置id，覆盖原文件内容
const generate = async () => {
    const docs = await getAllDocs(file => file.endsWith('.md') && !file.includes('index.md'));
    const videos = await getAllDocs(file => file.endsWith('.wav'), "public/voices");
    for (const dir of docs) {
        const filePath = path.resolve(BASE_URL, dir)
        const doc = await fs.readFile(filePath, 'utf-8')
        const fileBaseName = path.basename(dir, '.md')
        let tree = JSON.stringify(fromMarkdown(doc))
        // 设置ID
        tree = setId(tree, fileBaseName);
        // 获取所有句子
        const sentences = getAllSentences(tree, fileBaseName)
        // 生成语音
        await Promise.allSettled(
            sentences.reduce((arr, sentence, index) => {
                !videos.includes(`${fileBaseName}-${index}.wav`) && arr.push({
                    sentence, filename: `${fileBaseName}-${index}`
                })
                return arr
            }, []).map(({ sentence, filename }) => generateVoice(sentence, filename))
        )
        tree = JSON.parse(tree)
        // 文档标题
        const docTitle = tree.children[1].children[0].value;
        // 移除 thematicBreak + 第一个heading
        tree.children.splice(0, 2);
        // // 重新拼接文件内容
        const fileContent = `---\n${docTitle}\n---
            \n${toMarkdown(tree)}`;
        // 写入文件
        await fs.writeFile(filePath, fileContent, 'utf-8')
    }
}

generate()
