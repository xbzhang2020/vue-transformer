import { types as t, template } from '@babel/core'
import type { PluginObj } from '@babel/core'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'

type ComponentOptionsExpressionParams = Partial<Record<keyof ComponentOptions<Vue>, t.Expression>>

export const transformVue = () => {
  const defineComponentTemplate = template(`defineComponent(SOURCE)`)

  const getComponentOptionsExpression = (
    options: ComponentOptionsExpressionParams,
    otherProperties: t.ObjectProperty[] = []
  ) => {
    const properties = otherProperties
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
          const decorator = declaration.decorators?.[0]?.expression
          let isVueComponent = false
          let otherProperties: t.ObjectProperty[] = []

          if (
            t.isCallExpression(decorator) &&
            t.isIdentifier(decorator.callee) &&
            decorator.callee.name === 'Component'
          ) {
            isVueComponent = true
            const option = decorator.arguments[0] as t.ObjectExpression
            otherProperties = option.properties as t.ObjectProperty[]
          }

          // 判断是否为 Vue 组件
          if (t.isIdentifier(decorator) && decorator.name == 'Component') {
            isVueComponent = true
          }

          if (!isVueComponent) return

          const name = declaration.id.name
          const ast = defineComponentTemplate({
            SOURCE: getComponentOptionsExpression(
              {
                name: t.stringLiteral(name),
              },
              otherProperties
            ),
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
