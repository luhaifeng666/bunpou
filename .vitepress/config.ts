import fg from 'fast-glob'
import matter from 'gray-matter'
import { defineConfig } from 'vitepress'

interface SidebarConfig {
  text: string,
  path: string,
  leaves?: Array<SidebarConfig>
}

interface Items {
  text: string,
  collapsible?: boolean,
  link?: string,
  items?: Items[]
}

// 侧边栏
const sidebar = {}

/**
 * 获取目标目录下的所有 markdown 文件
 * @param link 
 * @returns 
 */
function getFiles(link: string): string[] {
  return fg.sync([`${link}/*.md`])
}

function getText(path: string): string {
  const { data } = matter.read(path)
  return data.title || path.replace(/^.{0,}(?=\/)\/|\.md/g, '')
}

/**
 * 获取 sidebar 菜单列表
 * @param type 
 * @param path 
 * @param leaves 
 * @returns 
 */
function getItems(type: string, path: string, leaves: Array<SidebarConfig>): Array<Items> {
  const linkPre = '/'
  const link = `${type}${path}`
  const items: Array<Items> = []
  // 单文件直接插入
  if (path.includes('.md')) {
    items.push({ text: getText(`${linkPre}${link}`), link })
  } else {
    if (leaves.length) {
      // 有子目录的情况
      leaves.forEach((leaf: SidebarConfig) => {
        items.push({ text: leaf.text, collapsible: true, items: getItems(type, `${path}/${leaf.path}`, leaf.leaves || [])})
      })
    }
    // 没有字目录的情况
    const files = getFiles(link)
    items.push(...files.map(file => ({
      text: getText(file),
      link: file.replace('', '')
    })))
  }

  return items
}

const SIDEBAR_CONFIG: {
  [key: string]: Array<SidebarConfig>
} = {
  'docs/': [
    { text: 'こそあど系列', path: 'kosoado' },
    { text: '助词', path: 'auxiliary' },
    { text: '动词', path: 'verb' },
    { text: '形容词', path: 'adjective' },
    { text: '语法', path: 'bunpou' },
  ]
}

// TODO Object.entires
Object.keys(SIDEBAR_CONFIG).forEach(key => {
  const config = SIDEBAR_CONFIG[key]
  sidebar[key] = []
  config.forEach(cfg => {
    const { text, path, leaves = [] } = cfg
    const items: Items[] = getItems(key, path, leaves)
    sidebar[key].push({ text, items, collapsed: true })
  })
})

export default defineConfig({
  title: "Bunpou",
  description: "用于查阅日语语法",
  lastUpdated: true,
  base: '/bunpou/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文法', link: '/docs/kosoado/こ' }
    ],

    search: {
      provider: 'local'
    },

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/luhaifeng666/bunpou' }
    ]
  }
})
