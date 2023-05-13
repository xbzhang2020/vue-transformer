import type { PluginObj } from '@babel/core'
import { types as t, template, transformFromAstSync } from '@babel/core'

export const transformVue = () => {
  const defineComponentTemplate = template(`defineComponent(SOURCE)`)

  const getComponentOptions = () => {}

  const obj: PluginObj = {
    visitor: {
      ExportDefaultDeclaration(path) {
        const exportNodeType = path.node.declaration.type
        if (exportNodeType === 'ClassDeclaration') {
          const declaration = path.node.declaration as t.ClassDeclaration
          const name = declaration.id.name

          const ast = defineComponentTemplate({
            SOURCE: t.objectExpression([t.objectProperty(t.stringLiteral('name'), t.identifier(name))]),
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
