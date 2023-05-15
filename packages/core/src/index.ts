import { read, readFileSync } from 'node:fs';
import { transformSync } from '@babel/core';
import compiler from 'vue-template-compiler';
import { transformVue } from './plugins/transform-vue.js';

const getCode = (file: string) => {
  return readFileSync(file, 'utf-8');
};

const getScript = (code: string) => {
  const sfc = compiler.parseComponent(code);
  const script = sfc.script;
  return script;
};

export const transform = (code: string) => {
  const res = transformSync(code, {
    sourceType: 'module',
    plugins: [
      ['@babel/plugin-syntax-typescript'],
      ['@babel/plugin-syntax-decorators', { version: '2023-01' }],
      transformVue,
    ],
  });
  return res;
};

const fileName = 'node_modules/vue2-example/src/components/class-base.vue';

const code = getCode(fileName);
const _script = getScript(code);
const res = transform(_script?.content || '');
console.log(res?.code);

// const content = `${code.slice(0, script.start)}\n${newContent}\n${code.slice(script.end)}`
// console.log(content)
