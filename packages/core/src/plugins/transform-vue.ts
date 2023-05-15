import { types as t, template } from '@babel/core';
import type { PluginObj } from '@babel/core';
import { transformVueClassComponent } from './transform-class-component.js';

const defineComponentTemplate = template(`defineComponent(SOURCE)`);

export const transformVue = () => {
  const obj: PluginObj = {
    visitor: {
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;
        let options = null;
        if (t.isClassDeclaration(declaration)) {
          options = transformVueClassComponent(declaration);
        } else if (t.isObjectExpression(declaration)) {
          options = declaration;
        }

        if (!options) return;
        const ast = defineComponentTemplate({
          SOURCE: options,
        }) as t.ExpressionStatement;
        path.get('declaration').replaceWith(ast.expression);
      },
    },
  };
  return obj;
};
