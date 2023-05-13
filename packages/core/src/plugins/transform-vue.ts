import { types as t, template } from '@babel/core'
import type { PluginObj } from '@babel/core'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'

type ComponentOptionsExpressionParams = Partial<Record<keyof ComponentOptions<Vue>, t.Expression>>

export const transformVue = () => {
  const defineComponentTemplate = template(`defineComponent(SOURCE)`)

  const getComponentOptionsExpression = (options: ComponentOptionsExpressionParams) => {
    const properties = []
    for (const key in options) {
      const expression = options[key as keyof ComponentOptionsExpressionParams] as t.Expression
      properties.push(t.objectProperty(t.stringLiteral(key), expression))
    }
    return t.objectExpression(properties)
  }

  const obj: PluginObj = {
    visitor: {
      ExportDefaultDeclaration(path) {
        const exportNodeType = path.node.declaration.type
        if (exportNodeType === 'ClassDeclaration') {
          const declaration = path.node.declaration as t.ClassDeclaration
          const name = declaration.id.name

          const ast = defineComponentTemplate({
            SOURCE: getComponentOptionsExpression({
              name: t.stringLiteral(name),
            }),
          }) as t.ExpressionStatement

          path.get('declaration').replaceWith(ast.expression)
          return
        }

        if (exportNodeType === 'ObjectExpression') {
          const ast = defineComponentTemplate({
            SOURCE: path.node.declaration,
          }) as t.ExpressionStatement
          path.get('declaration').replaceWith(ast.expression)
        }
      },
    },
  }
  return obj
}
