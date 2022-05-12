import React from 'react';

import { storiesOf } from '@storybook/react';
import { FunctionDefinition, STKindChecker, traversNode } from '@wso2-enterprise/syntax-tree';

import { visitor as FunctionFindingVisitor } from "../visitors/function-finding-vistor"

import stList from "./data/syntaxTreeList.json";
import { StatementEditorWrapperStoryWrapper } from './statementEditorWrapperStoryWrapper';

Object.entries(stList).forEach(([file, syntaxTree]) => {
  FunctionFindingVisitor.setFunctionsNull();
  traversNode(syntaxTree, FunctionFindingVisitor);
  const functions = FunctionFindingVisitor.getFunctions();
  functions.forEach((functionDefinition: FunctionDefinition) => {
    const stories = storiesOf('Statement Editor/StatementEditor/' +  functionDefinition.functionName.value, module);

    const functionBody = functionDefinition.functionBody
    if (STKindChecker.isFunctionBodyBlock(functionBody) && functionBody.statements.length > 0){
      stories.add(
        functionDefinition.functionName.value + "_" + functionBody.statements[0].kind,
        () => {
          return (
            <StatementEditorWrapperStoryWrapper statement={functionBody.statements[0]} file={file} />
          );
        }
      );
    }
  });
})
