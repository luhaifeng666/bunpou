import { generateVoice } from "./speech.js";
import path from "node:path";
import fs from 'node:fs/promises'
import { argv } from "zx";
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { getAllDocs } from './index.js'

const BASE_URL = path.resolve('docs');

/**
 * 设置Id
 * @param {*} tree
 * @param {*} fileBaseName 
 */
const setId = (tree, fileBaseName) => {
    let count = 0;
    return tree.replace(/(grammer-content)\s[id\=\'.*?\']*(.*?\/>)/gi, (data, str1, str2) => {
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
        })
            .replace(/.*sentence=[\\]{0,2}["|'](.*?)[\\]{0,2}["|'].*/g, "$1") // 取 sentence 属性值
            .replace(/\<del\>.*?\<\/del\>/g, '') // 删除del标签及其中的内容
            .replace(/[^\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]|[\(|（](.*?)[）|\)]/g, '') // 只保留日文字符
    )

// 设置id，覆盖原文件内容
const generate = async () => {
    const { filter, cover } = argv;
    const voices = await getAllDocs(file => file.endsWith('.wav'), "public/voices");
    const voicePreNames = Array.from(new Set(voices.map(name => name.replace(/\-[0-9]{1,2}\.wav$/g, ''))))
    let docs = (await getAllDocs(file => file.endsWith('.md') && !file.includes('index.md')))
    // 是否开启过滤模式， 不开启默认执行所有的doc文件
    if (filter) {
        docs = docs.filter(
            doc => !voicePreNames.includes(path.basename(doc).replace('.md', ''))
        );
    }
    for (const dir of docs) {
        const filePath = path.resolve(BASE_URL, dir)
        const doc = await fs.readFile(filePath, 'utf-8')
        const fileBaseName = path.basename(dir, '.md')
        let tree = JSON.stringify(fromMarkdown(doc))
        // 设置ID
        tree = setId(tree, fileBaseName);
        // 获取所有句子
        const sentences = getAllSentences(tree, fileBaseName)
        if (sentences.length) {
            // 生成语音
            for (const [index, sentence] of sentences.entries()) {
                !voices.includes(`${fileBaseName}-${index}.wav`) && await generateVoice(sentence, `${fileBaseName}-${index}`)
            }
            if (cover) {
                tree = JSON.parse(tree)
                // 文档标题
                const docTitle = tree.children[1].children[0].value;
                // 移除 thematicBreak + 第一个heading
                tree.children.splice(0, 2);
                // 重新拼接文件内容
                const fileContent = `---\n${docTitle}\n---
              \n${toMarkdown(tree)}`;
                // 写入文件
                await fs.writeFile(filePath, fileContent, 'utf-8')
            }
        }
    }
}

generate()
