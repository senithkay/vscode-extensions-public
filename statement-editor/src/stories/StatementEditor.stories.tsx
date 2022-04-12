import React from 'react';

import { storiesOf } from '@storybook/react';
import { FunctionDefinition, STKindChecker, STNode, traversNode } from '@wso2-enterprise/syntax-tree';

import { visitor as FunctionFindingVisitor } from "../visitors/function-finding-vistor"

import stList from "./data/syntaxTreeList.json";
import { StatementEditorWrapper } from './statementEditorWrapper';

Object.entries(stList).forEach(([file, syntaxTree]) => {
  FunctionFindingVisitor.setFunctionsNull();
  traversNode(syntaxTree, FunctionFindingVisitor);
  const functions = FunctionFindingVisitor.getFunctions();
  functions.forEach((functionDefintion: FunctionDefinition) => {
    const stories = storiesOf('Statement Editor/StatementEditor/' +  functionDefintion.functionName.value, module);

    const functionBody = functionDefintion.functionBody
    if (STKindChecker.isFunctionBodyBlock(functionBody) && functionBody.statements.length > 0){
      stories.add(
        functionDefintion.functionName.value + "_" + functionBody.statements[0].kind,
        () => {
          return (
            <StatementEditorWrapper  statement={functionBody.statements[0]} file={file} />
            );
        }
      );
    }
  });
})
