import { readFileSync } from 'node:fs'
import compiler from 'vue-template-compiler'

// 1. 读取文件内容
const fileName = 'node_modules/vue2-example/src/components/option-base.vue'
const code = readFileSync(fileName, 'utf-8')
console.log(code)

// 2. 解析 script 部分
const sfc = compiler.parseComponent(code)
const script = sfc.script
// console.log(script)
// console.log(sfc.script.content)
