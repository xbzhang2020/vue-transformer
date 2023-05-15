import { types as t, template } from '@babel/core'
import type { PluginObj, Visitor } from '@babel/core'

// import type Vue from 'vue'
// import type { ComponentOptions } from 'vue'

// type ComponentOptionsExpressionParams = Partial<Record<keyof ComponentOptions<Vue>, t.Expression>>

interface ClassComponentState {
  data: any[]
}

const defineComponentTemplate = template(`defineComponent(SOURCE)`)
const defineRefTemplate = template(`const KEY = ref(VALUE)`)

const hasProperty = (key: string, properties: t.ObjectExpression['properties']) => {
  const item = properties.find((item) => t.isObjectProperty(item) && t.isIdentifier(item.key) && item.key.name === key)
  return !!item
}

const collectDataProperty = (node: t.ClassProperty, state: ClassComponentState) => {
  const item = {
    key: node.key,
    value: node.value,
  }
  state.data.push(item)
}

const transformDataProperty = (node: any) => {
  const ast = defineRefTemplate({
    KEY: node.key,
    VALUE: node.value,
  }) as t.ExpressionStatement
  return ast
}

export const transformVueClassComponent = (declaration: t.ClassDeclaration) => {
  let ast = null
  let isVueComponent = false
  const decorator = declaration.decorators?.[0]?.expression
  const properties: t.ObjectExpression['properties'] = []

  if (t.isIdentifier(decorator) && decorator.name == 'Component') {
    isVueComponent = true
  }

  if (t.isCallExpression(decorator) && t.isIdentifier(decorator.callee) && decorator.callee.name === 'Component') {
    isVueComponent = true
    const option = decorator.arguments[0] as t.ObjectExpression
    if (option) {
      properties.push(...option.properties)
    }
  }

  if (!isVueComponent) return ast

  // 解析 name
  if (!hasProperty('name', properties)) {
    const name = t.objectProperty(t.identifier('name'), t.stringLiteral(declaration.id.name))
    properties.unshift(name)
  }

  const state = {
    data: [],
  }

  // 遍历 class body
  declaration.body.body.forEach((item) => {
    if (t.isClassProperty(item)) {
      collectDataProperty(item, state)
    }
  })

  const option = t.objectExpression(properties)
  // ast = defineComponentTemplate({
  //   SOURCE: option,
  // }) as t.ExpressionStatement

  return option
}
