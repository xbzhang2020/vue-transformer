export const transformVue = ({ types, template }) => {
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        // console.log(path.node.declaration)
        // console.log(path.get('declaration'))

        const ast = template(`defineComponent(SOURCE)`)({
          SOURCE: path.node.declaration,
        })

        // console.log(generate.default(ast).code)
        path.get('declaration').replaceWith(ast)
      },
    },
  }
}
