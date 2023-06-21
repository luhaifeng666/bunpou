/*
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-06-14 08:38:26
 * @LastEditors: luhaifeng666
 * @LastEditTime: 2023-06-14 22:23:38
 * @Description: 
 */
import DefaultTheme from 'vitepress/theme'
import GrammerContent from './components/GrammerContent.vue'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ctx.app.component('GrammerContent', GrammerContent)
  }
}