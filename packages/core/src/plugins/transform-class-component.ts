import { types as t, template } from '@babel/core';
import type { PluginObj, Visitor } from '@babel/core';
import { it } from 'node:test';

// import type Vue from 'vue'
// import type { ComponentOptions } from 'vue'

// type ComponentOptionsExpressionParams = Partial<Record<keyof ComponentOptions<Vue>, t.Expression>>

interface ClassComponentState {
  data: t.ClassProperty[];
}

const defineRefTemplate = template(`const KEY = ref(VALUE)`);

class ClassComponentParaser {
  declaration: t.ClassDeclaration;
  properties: t.ObjectExpression['properties'];
  state: ClassComponentState;

  constructor(declaration: t.ClassDeclaration) {
    this.declaration = declaration;
    this.state = { data: [] };
    this.properties = [];
  }

  isClassCompent() {
    const decorator = this.declaration.decorators?.[0]?.expression;
    if (!decorator) return null;

    if (t.isIdentifier(decorator) && decorator.name == 'Component') {
      return decorator;
    }

    if (t.isCallExpression(decorator) && t.isIdentifier(decorator.callee) && decorator.callee.name === 'Component') {
      return decorator;
    }
    return null;
  }

  hasProperty(key: string) {
    const item = this.properties.find((item) => t.isObjectProperty(item) && t.isIdentifier(item.key, { name: key }));
    return !!item;
  }

  parseName() {
    const name = t.objectProperty(t.identifier('name'), t.stringLiteral(this.declaration.id.name));
    this.properties.unshift(name);
  }

  parseData(node: t.ClassProperty) {
    this.state.data.push(node);
  }

  transformData(node: t.ClassProperty) {
    const ast = defineRefTemplate({
      KEY: node.key,
      VALUE: node.value,
    }) as t.ExpressionStatement;
    return ast;
  }

  parseSetupBody() {
    const data = this.state.data.map(this.transformData);
    return t.blockStatement(data);
  }

  parseSetupMethod() {
    const body = this.parseSetupBody();
    const method = t.objectMethod('method', t.identifier('setup'), [t.identifier('props'), t.identifier('root')], body);
    this.properties.push(method);
  }

  getComponentOptions() {
    const option = t.objectExpression(this.properties);
    return option;
  }
}

export const transformVueClassComponent = (declaration: t.ClassDeclaration) => {
  const properties: t.ObjectExpression['properties'] = [];

  const compParser = new ClassComponentParaser(declaration);
  const isVueClassComponent = compParser.isClassCompent();
  if (!isVueClassComponent) return;

  if (t.isCallExpression(isVueClassComponent)) {
    const option = isVueClassComponent.arguments[0] as t.ObjectExpression;
    if (option) {
      compParser.properties.push(...option.properties);
    }
  }

  compParser.parseName();

  declaration.body.body.forEach((item) => {
    if (t.isClassProperty(item)) {
      compParser.parseData(item);
    }
  });

  compParser.parseSetupMethod();
  return compParser.getComponentOptions();
};
