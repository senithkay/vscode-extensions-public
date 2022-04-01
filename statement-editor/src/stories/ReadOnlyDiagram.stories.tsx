import React, { useEffect, useState } from 'react';

import { Story } from '@storybook/react/types-6-0';
// import { DiagramGeneratorProps } from '../DiagramGenerator';
import { StatementEditor, StatementEditorProps } from '../components/StatementEditor';
import { CtxProviderProps, StatementEditorContextProvider } from '../store/statement-editor-context';

import devProject from "./data/devproject.json";
// import { DiagramGeneratorWrapper } from './DiagramGeneratorWrapper';
// import { getFileContent, getLibrariesData, getLibrariesList, getLibraryData, langClientPromise, updateFileContent } from './story-utils';

import foreachModel from "./data/foreach-st-model.json";
import ifElseBooleanModel from "./data/ifelse-booleaLiteral-st-model.json";
import ifElseModel from "./data/ifelse-st-model.json";
import varDeclBinaryExprModel from "./data/local-var-decl-with-binary-expr-st-model.json";
import panicModel from "./data/panic-st-model.json";
import returnModel from "./data/return-st-model.json";
import stringModel from "./data/varDecl-stringLiteral-model.json";
import whileStmtModel from "./data/while-st-model.json";
import { ModulePart, STNode } from '@wso2-enterprise/syntax-tree';
// import { fetchSyntaxTree, getSourceRoot } from './story-utils';
import { ManualIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { ModuleElement } from '../components/LibraryBrowser/ModuleElement';
import { fetchSyntaxTree, getSourceRoot, langClientPromise } from './story-utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import {
  ExpressionEditorLangClientInterface,
  LibraryDataResponse,
  LibraryDocResponse,
  LibrarySearchResponse,
  STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";


export default {
    title: 'Statement Editor/StatementEditor',
    component: StatementEditor,
};

const dummyFunction = (arg: any) => {
};


const fileName: string = "main.bal";


const Template: Story<StatementEditorProps> = () => {

  const [st, setSt] = useState<ModulePart>(undefined);
  const filePath = `${getSourceRoot() + "stories/data/project/" + fileName}`;

  useEffect(() => {
      async function setSyntaxTree() {
          const syntaxTree = await fetchSyntaxTree(filePath);
          setSt(syntaxTree);
      }
      setSyntaxTree();
  }, []);

  if (!st) {
      return <></>;
  }

  // const functionST: FunctionDefinition = st && STKindChecker.isFunctionDefinition(st.members[0]) && st.members[0];

  const args1 : StatementEditorProps = {
    label: "Statement",
    initialSource: st.source,
    onWizardClose: dummyFunctionWithoutArgs,
    onCancel: dummyFunctionWithoutArgs,
    formArgs: {
      formArgs: st
    },
    getLangClient: () => Promise.resolve(undefined),
    applyModifications: dummyFunction,
    config: {
      type: "LocalVarDecl",
      model: st
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

  return st &&
      // tslint:disable-next-line: jsx-wrap-multiline
      <StatementEditor {...args1} />;
}


const dummyFunctionWithoutArgs = () => {
};
// const Template: Story<StatementEditorProps> = (args) => <StatementEditor {...args} />;

export const storyScenario: Story = Template.bind({});



// const [st, setSt] = useState<ModulePart>(undefined);
// const filePath = `/home/jegasingama/wso2/ballerina-low-code-editor/statement-editor/src/stories/data/project/main.bal`;

// useEffect(() => {
//     async function setSyntaxTree() {
//         const syntaxTree = await fetchSyntaxTree(filePath);
//         setSt(syntaxTree);
//     }
//     setSyntaxTree();
// }, []);

// const dummyFunction = (arg: any) => {
// };

// const dummyFunctionWithoutArgs = () => {
// };

// const statementEditorContextProps: CtxProviderProps = {
//     model: st,
//     currentModel: {model: st},
//     getLangClient: () => (Promise.resolve({} as any)),
//     applyModifications: () => (Promise.resolve({} as any)),
//     library: {
//         getLibrariesList: () => (Promise.resolve({} as any)),
//         getLibrariesData: () => (Promise.resolve({} as any)),
//         getLibraryData: () => (Promise.resolve({} as any))
//     },
//     currentFile: {
//         content: "",
//         path: "",
//         size: 0
//     },
//     initialSource: ''
//   }
  

  
// const Template: Story<StatementEditorProps> = (args: StatementEditorProps) => (
//     <StatementEditorContextProvider {...statementEditorContextProps}>
//         <StatementEditor {...args} />;
//     </StatementEditorContextProvider>
// );

// export const storyScenario: Story = Template.bind({});

// storyScenario.args = {
    
//     kind: "DefaultString",
//     label: "Variable Statement",
//     formArgs: { model: st },
//     validate: dummyFunction,
//     isMutationInProgress: false,
//     validForm: true,
//     onCancel: dummyFunctionWithoutArgs,
//     onSave: dummyFunctionWithoutArgs,
//     onChange: dummyFunction

    
// }