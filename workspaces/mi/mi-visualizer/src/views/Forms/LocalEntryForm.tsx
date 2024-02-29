/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { AutoComplete, Button, TextField , Codicon, Typography} from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "./Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter, lintGutter, Diagnostic } from "@codemirror/lint";

import {
  CreateLocalEntryRequest,
} from "@wso2-enterprise/mi-core";
import { get, set } from "lodash";

const WizardContainer = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
  padding-bottom: 20px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;
const BrowseBtn = styled(VSCodeButton)`
  width: fit-content;
  margin-top: 18px;
`;
const BrowseBtn2 = styled(VSCodeButton)`
  width: fit-content;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface Region {
  label: string;
  value: string;
}

export function LocalEntryWizard() {
  const { rpcClient } = useVisualizerContext();
  const [localEntryName, setLocalEntryName] = useState("");
  const [localEntryType, setLocalEntryType] = useState("In-Line Text Entry");
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState([]);
  const [URL, setURL] = useState("");
  const [projectDir, setProjectDir] = useState("");
  const [validationMessage, setValidationMessage] = useState(true);
  const [code, setCode] = useState(`<xml version="1.0" encoding="UTF-8">
  </xml> 
  `);

  useEffect(() => {
    (async () => {
      const localEntryDirectory = await rpcClient
        .getMiDiagramRpcClient()
        .getLocalEntryDirectory();
      setProjectDir(localEntryDirectory.data);
    })();
  }, []);

  useEffect(() => {
    setValidationMessage(true);
    if (localEntryType === "In-Line XML Entry") {
      handleXMLInputChange(code);
    }
  }, [localEntryType]);

  const localEntryTypes = [
    "In-Line Text Entry",
    "In-Line XML Entry",
    "Source URL Entry",
  ];

  const handleLocalEntryTypeChange = (type: string) => {
    setLocalEntryType(type);
  };

  const handleURLDirSelection = async () => {
    const projectDirectory = await rpcClient
      .getMiDiagramRpcClient()
      .askFileDirPath();
    setURL(projectDirectory.path);
  };

  const isValidXML = (xmlString: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    return !xmlDoc.getElementsByTagName("parsererror").length;
  };
  const XMLannotations = (xmlString: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    return xmlDoc;
  };

  const handleXMLInputChange = (text: string) => {
    setCode(text);
    setValidationMessage(true);
    setErrors(getLintErrors(XMLannotations(text)));
    if (localEntryType === "In-Line XML Entry" && !isValidXML(text)) {
      setValidationMessage(false);
    }
  };

  const getLintErrors = (xmlDoc: Document) => {
    const errors: {
      from: ChildNode;
      to: ChildNode;
      message: string;
      severity: string;
    }[] = [];
    const parserErrors = xmlDoc.getElementsByTagName("parsererror");
    for (let i = 0; i < parserErrors.length; i++) {
      const parserError = parserErrors[i];
      const from = parserError.firstChild
        ? parserError.firstChild
        : parserError;
      const to = parserError.lastChild ? parserError.lastChild : parserError;
      errors.push({ from, to, message: "Syntax Error", severity: "error" });
    }
    return errors;
  };
  const handleCreateLocalEntry = async () => {
    if (localEntryType === "In-Line XML Entry") {
      if (validationMessage === false) {
        console.error("Invalid XML");
        return;
      }
    }
    const createLocalEntryParams: CreateLocalEntryRequest = {
      directory: projectDir,
      name: localEntryName,
      type: localEntryType,
      value: localEntryType === "In-Line XML Entry" ? code : value,
      URL: URL,
    };
    const file = await rpcClient
      .getMiDiagramRpcClient()
      .createLocalEntry(createLocalEntryParams);
    rpcClient.getMiDiagramRpcClient().openFile(file);  
    rpcClient.getMiDiagramRpcClient().closeWebView();
  };

  const handleCancel = () => {
    rpcClient.getMiDiagramRpcClient().closeWebView();
  };

  const isValid: boolean =
    localEntryName.length > 0 &&
    localEntryType.length > 0 &&
    (!(localEntryType === "In-Line Text Entry") || value.length > 0) &&
    (!(localEntryType === "Source URL Entry") || URL.length > 0) &&
    (!(localEntryType === "In-Line XML Entry") || code.length > 0);

  return (
    <WizardContainer>
        <SectionWrapper>
            <Container>
                <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                <div style={{ marginLeft: 30 }}>
                    <Typography variant="h3">Inbound Endpoint Artifact</Typography>
                </div>
            </Container>        
            <TextField
              value={localEntryName}
              id="name-input"
              label="Local Entry Name"
              placeholder="Name"
              validationMessage="LocalEntry name is required"
              onChange={(text: string) => setLocalEntryName(text)}
              autoFocus
              required
            />
    
            <span>Local Entry Creation Type</span>
            <AutoComplete
              items={localEntryTypes}
              selectedItem={localEntryType}
              onChange={handleLocalEntryTypeChange}
              sx={{ width: "100%" }}
            ></AutoComplete>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span> Save Local Entry In: </span>
              <TextField
                placeholder="projectDir"
                onChange={(text: string) => setProjectDir(text)}
                value={projectDir}
                id="dir-input"
                size={100}
                readonly={true}
                //sx={{ flexGrow: 1, marginRight: '40px' }}
              />
            </div>
    
            <h5>Advanced Configuration</h5>
            {localEntryType === "In-Line Text Entry" && (
                <TextField
                  placeholder="Value"
                  label="Value"
                  onChange={(text: string) => setValue(text)}
                  value={value}
                  id="value-input"
                  size={100}
                  required
                />
            )}
            {localEntryType === "In-Line XML Entry" && (
                <CodeMirror
                  value={code}
                  extensions={[xml(), linter(() => errors)]}
                  theme={oneDark}
                  onChange={(text: string) => handleXMLInputChange(text)}
                  height="200px"
                  autoFocus
                />
            )}
            {localEntryType === "Source URL Entry" && (
              <>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    placeholder="URL"
                    label="URL"
                    onChange={(text: string) => setURL(text)}
                    value={URL}
                    id="url-input"
                    size={100}
                    sx={{ flexGrow: 0.5 }}
                  />
                  <BrowseBtn
                    onClick={handleURLDirSelection}
                    id="select-project-dir-btn"
                  >
                    Browse
                  </BrowseBtn>
                </div>
              </>
            )}
        </SectionWrapper>
        <ActionContainer>
          <Button appearance="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={handleCreateLocalEntry}
            disabled={!isValid}
          >
            Create
          </Button>
        </ActionContainer>
    </WizardContainer>
  );
}
