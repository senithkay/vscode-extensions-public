import React, { useEffect, useState } from 'react';

import { storiesOf } from '@storybook/react';


import devProject from "./data/devproject.json";
import { fetchSyntaxTree, getFileContent, getLibrariesData, getLibrariesList, getLibraryData, langClientPromise, updateFileContent } from './story-utils';
import { FunctionBodyBlock, FunctionDefinition, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { StatementEditor, StatementEditorProps } from '../components/StatementEditor';

export const stories = storiesOf('StatementEditor', module);

console.log("testing")

const dummyFunction = (arg: any) => {
};

const dummyFunctionWithoutArgs = () => {
};

async function setSyntaxTree(balFile: string) {
  const syntaxTree = await fetchSyntaxTree(balFile);
  return syntaxTree;
}
devProject.balFiles.forEach(async (balFile: string) => {

  const filePath = balFile.substring(devProject.projectPath.length);

  console.log({"testing": balFile})

  const st = await fetchSyntaxTree(balFile);

console.log({"testing": st})

if (!st) {
    return <></>;
}

const functionST: FunctionDefinition = st && STKindChecker.isFunctionDefinition(st.members[0]) && st.members[0];
const functionBody: FunctionBodyBlock = functionST && STKindChecker.isFunctionBodyBlock(functionST.functionBody) && functionST.functionBody;

if (functionBody.statements.length > 0 ) {
  functionBody.statements.forEach ( (statement) => {
    console.log({"testing": statement})
  stories.add(
    statement.source,
    () => {
      const statementProps = getDiagramGeneratorProps(statement, filePath);
      return <StatementEditor {...statementProps} />;
    }
  )
  })


  }

  console.log({"testing": stories})

// console.log("testing")
// const statementProps = getDiagramGeneratorProps(st, filePath);
// console.log("testing2")

// stories.add(
//   filePath,  
//   () => <StatementEditor {...statementProps} />
  
// )
});

function getDiagramGeneratorProps(statement: any, filePath: string): StatementEditorProps {
  console.log("testing4")

  return {
    label: statement.kind,
    initialSource: statement.source,
    onWizardClose: dummyFunctionWithoutArgs,
    onCancel: dummyFunctionWithoutArgs,
    formArgs: {
      formArgs: statement
    },
    getLangClient: () => Promise.resolve(undefined),
    applyModifications: dummyFunction,
    config: {
      type: statement.kind,
      model: statement
    },
    currentFile: {
      content: filePath,
      path: filePath,
      size: 10
    },
    library :{
      getLibrariesList: () => Promise.resolve(undefined),
      getLibrariesData: () => Promise.resolve(undefined),
      getLibraryData: () => Promise.resolve(undefined),
    }

  }
}
