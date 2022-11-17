import React from 'react';


import { storiesOf } from '@storybook/react';
import { FunctionDefinition, traversNode } from '@wso2-enterprise/syntax-tree';

import { visitor as FunctionFindingVisitor } from "../visitors/function-finding-vistor";

import stList from "./data/syntaxTreeList.json";
import { StatementRendererWrapper } from './statementRendererWrapper';


Object.entries(stList).forEach(([file, syntaxTree]) => {
  const stories = storiesOf('Statement Editor/StatementRenderer/' + file, module);
  FunctionFindingVisitor.setFunctionsNull();
  traversNode(syntaxTree, FunctionFindingVisitor);
  const functions: FunctionDefinition[] = FunctionFindingVisitor.getFunctions();
  stories.add(
    file,
    () => {
      return (
        <StatementRendererWrapper functions={functions} />
        );
    }
  );
});
