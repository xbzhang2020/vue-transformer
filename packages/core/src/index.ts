import { readFileSync } from 'node:fs'
import { transformSync } from '@babel/core'
import compiler from 'vue-template-compiler'
import { transformVue } from './plugins/transform-vue.js'

// 1. 读取文件内容
const fileName = 'node_modules/vue2-example/src/components/class-base.vue'
const code = readFileSync(fileName, 'utf-8')

// 2. 解析 script 部分
const sfc = compiler.parseComponent(code)
const script: any = sfc.script
// console.log(script)

// 3. 使用 babel 处理 script 部分
const res: any = transformSync(script.content, {
  sourceType: 'module',
  plugins: [
    ['@babel/plugin-syntax-typescript'],
    ['@babel/plugin-syntax-decorators', { version: '2023-01' }],
    transformVue,
  ],
})
const newContent = res.code
console.log(res.code)

// 4. 输出结果
// const content = `${code.slice(0, script.start)}\n${newContent}\n${code.slice(script.end)}`
// console.log(content)
