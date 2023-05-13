import type { PluginObj } from '@babel/core'
import { types as t, template } from '@babel/core'

export const transformVue = () => {
  const obj: PluginObj = {
    visitor: {
      ExportDefaultDeclaration(path) {
        const exportNodeType = path.node.declaration.type
        if (exportNodeType === 'ClassDeclaration') {
          // console.log(path.node.declaration)
          return
        }

        if (exportNodeType === 'ObjectExpression') {
          const expressionFn = template(`defineComponent(SOURCE)`)
          const ast = expressionFn({
            SOURCE: path.node.declaration,
          }) as t.ExpressionStatement
          path.get('declaration').replaceWith(ast)
        }
      },
    },
  }
  return obj
}
