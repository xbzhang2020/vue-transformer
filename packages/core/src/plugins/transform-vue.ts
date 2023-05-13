import { types as t, template } from '@babel/core'
import type { PluginObj } from '@babel/core'
// import type Vue from 'vue'
// import type { ComponentOptions } from 'vue'

// type ComponentOptionsExpressionParams = Partial<Record<keyof ComponentOptions<Vue>, t.Expression>>

const defineComponentTemplate = template(`defineComponent(SOURCE)`)

const parseVueClassComponent = (declaration: t.ClassDeclaration) => {
  let ast = null
  let isVueComponent = false
  const decorator = declaration.decorators?.[0]?.expression
  let properties: t.ObjectExpression['properties'] = []

  if (t.isIdentifier(decorator) && decorator.name == 'Component') {
    isVueComponent = true
  }

  if (t.isCallExpression(decorator) && t.isIdentifier(decorator.callee) && decorator.callee.name === 'Component') {
    isVueComponent = true
    const option = decorator.arguments[0] as t.ObjectExpression
    properties = option.properties
  }

  if (!isVueComponent) return ast

  const name = declaration.id.name
  const option = t.objectExpression(properties)
  ast = defineComponentTemplate({
    SOURCE: option,
  }) as t.ExpressionStatement

  return ast
}

const parseVueOptionComponent = (declaration: t.ObjectExpression) => {
  const ast = defineComponentTemplate({
    SOURCE: declaration,
  }) as t.ExpressionStatement
  return ast
}

export const transformVue = () => {
  const obj: PluginObj = {
    visitor: {
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration
        if (t.isClassDeclaration(declaration)) {
          const ast = parseVueClassComponent(declaration)
          if (!ast) return
          path.get('declaration').replaceWith(ast.expression)
          return
        }

        if (t.isObjectExpression(declaration)) {
          const ast = parseVueOptionComponent(declaration)
          if (!ast) return
          path.get('declaration').replaceWith(ast.expression)
        }
      },
    },
  }
  return obj
}
