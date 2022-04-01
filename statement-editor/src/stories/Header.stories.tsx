import React, { useEffect, useState } from 'react';

import { storiesOf } from '@storybook/react';


import devProject from "./data/devproject.json";
import { fetchSyntaxTree, getFileContent, getLibrariesData, getLibrariesList, getLibraryData, langClientPromise, updateFileContent } from './story-utils';
import { FunctionBodyBlock, FunctionDefinition, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { StatementEditor, StatementEditorProps } from '../components/StatementEditor';

const stories = storiesOf('Statement Editor/Development/project', module);


const dummyFunction = (arg: any) => {
};

const dummyFunctionWithoutArgs = () => {
};

devProject.balFiles.forEach((balFile: string) => {

  const [st, setSt] = useState<ModulePart>(undefined);

  const filePath = balFile.substring(devProject.projectPath.length);

    async function setSyntaxTree() {
        const syntaxTree = await fetchSyntaxTree(filePath);
        setSt(syntaxTree);
    }
    setSyntaxTree();
    console.log("yethukku")


    if (!st) {
      console.log("yethukku")
        return <></>;
    }
    
    const functionST: FunctionDefinition = st && STKindChecker.isFunctionDefinition(st.members[0]) && st.members[0];
    const functionBody: FunctionBodyBlock = functionST && STKindChecker.isFunctionBodyBlock(functionST.functionBody) && functionST.functionBody;
    
    if (functionBody.statements.length > 0 ) {
      functionBody.statements.forEach ( (statement) => {
      stories.add(
        statement.source,
        () => {
          const statementProps = getDiagramGeneratorProps(statement, filePath);
          return <StatementEditor {...statementProps} />;
        }
      )
      })
    
      }
     
    
}, []);


function getDiagramGeneratorProps(statement: any, filePath: string): StatementEditorProps {
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
