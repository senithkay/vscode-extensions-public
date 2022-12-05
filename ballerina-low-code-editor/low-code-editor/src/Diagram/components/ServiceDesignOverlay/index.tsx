/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useEffect, useRef } from "react";

import { DataMapper } from "@wso2-enterprise/ballerina-data-mapper";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
  ConfigOverlayFormStatus,
  DiagramEditorLangClientInterface,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
  FunctionDefinition,
  ModulePart,
  NodePosition,
  ServiceDeclaration,
  STKindChecker,
  STNode,
} from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor";

import { Context } from "../../../Contexts/Diagram";
import { RecordEditor } from "../FormComponents/ConfigForms";
import { DiagramOverlay, DiagramOverlayContainer } from "../Portals/Overlay";
import { ServiceDesign } from "../ServiceDesign";

import { ServiceDesignStyles } from "./style";

export interface DataMapperProps {
  model?: STNode;
  targetPosition?: NodePosition;
  onCancel?: () => void;
  configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function ServiceDesignOverlay(props: DataMapperProps) {
  const { targetPosition, onCancel: onClose, model } = props;

  const serviceDesignClasses = ServiceDesignStyles();

  const {
    props: { currentFile, stSymbolInfo, importStatements, syntaxTree: lowcodeST },
    api: {
      code: { modifyDiagram, updateFileContent },
      ls: { getDiagramEditorLangClient },
      library,
    },
  } = useContext(Context);

  const [functionST, setFunctionST] = React.useState<ServiceDeclaration>(undefined);

  useEffect(() => {
    if (model && STKindChecker.isServiceDeclaration(model)) {
      setFunctionST(model);
    }
  }, [model]);

  return (
    <DiagramOverlayContainer>
      <DiagramOverlay
        position={{ x: 0, y: 0 }}
        stylePosition={"absolute"}
        className={serviceDesignClasses.overlay}
      >
        <div className={serviceDesignClasses.container}>
          <ServiceDesign
            fnST={functionST}
            langClientPromise={
              getDiagramEditorLangClient() as unknown as Promise<IBallerinaLangClient>
            }
            currentFile={currentFile}
            onClose={onClose}
          />
        </div>
      </DiagramOverlay>
    </DiagramOverlayContainer>
  );
}
