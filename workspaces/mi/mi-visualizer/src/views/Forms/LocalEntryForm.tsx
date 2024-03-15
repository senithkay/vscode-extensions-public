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
import { linter } from "@codemirror/lint";
import {CreateLocalEntryRequest, EVENT_TYPE, MACHINE_VIEW} from "@wso2-enterprise/mi-core";
import path from "path";
import { set } from "lodash";

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

export interface LocalEntryWizardProps {
    path:string
}

export function LocalEntryWizard(props: LocalEntryWizardProps) {
    const { rpcClient } = useVisualizerContext();
    const [localEntry, setLocalEntry] = useState({
        name: "",
        type: "In-Line Text Entry",
        inLineTextValue: "",
        inLineXmlValue: `<xml version="1.0" encoding="UTF-8"></xml>` ,
        sourceURL: ""
    });
    const [errors, setErrors] = useState([]); 
    const [projectDir, setProjectDir] = useState(props.path);
    const [existingFilePath, setExistingFilePath] = useState(props.path);
    const isNewTask = !existingFilePath.endsWith(".xml");
    const [validationMessage, setValidationMessage] = useState(true);
    const [message , setMessage] = useState({
        isError: false,
        text: ""
    });
  
    useEffect(() => {
        (async () => {
            const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({path: props.path})).path;
            const messageStoreDir = path.join(projectDir, "src", "main", "wso2mi", "artifacts", "local-entries");
            setProjectDir(messageStoreDir);
            if (!isNewTask) {
                if (existingFilePath.includes('/localEntries')) {
                    setExistingFilePath(existingFilePath.replace('/localEntries', '/local-entries'));
                }
                const existingLocalEntry = await rpcClient.getMiDiagramRpcClient().getLocalEntry({ path: existingFilePath });
                setLocalEntry(existingLocalEntry);                  
            }
        })();
    }, []);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;
        if (!isValid){
            handleMessage("All fields are required", true);
        } else if (localEntry.name.match(INVALID_CHARS_REGEX)) {
            handleMessage("Local Entry Name cannot contain special characters", true);
        } else {
            handleMessage("", false);
        }
    }, [localEntry]);
  
    useEffect(() => {
        setValidationMessage(true);
        if (localEntry.type === "In-Line XML Entry") {
            handleXMLInputChange(localEntry.inLineXmlValue);
        }
    }, [localEntry.type]);
  
    const localEntryTypes = [
        "In-Line Text Entry",
        "In-Line XML Entry",
        "Source URL Entry",
    ];
    
    const handleLocalEntryFieldChange = (field: string, value: string) => {
        setLocalEntry((prev:any) => ({ ...prev , [field]: value }))
    }
  
    const handleURLDirSelection = async () => {
        const fileDirectory = await rpcClient
            .getMiDiagramRpcClient()
            .askFileDirPath();
        handleLocalEntryFieldChange("sourceURL", fileDirectory.path);
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
        handleLocalEntryFieldChange("inlineXmlValue", text);
        setValidationMessage(true);
        setErrors(getLintErrors(XMLannotations(text)));
        if (localEntry.type === "In-Line XML Entry" && !isValidXML(text)) {
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
        if (localEntry.type === "In-Line XML Entry") {
            if (validationMessage === false) {
              console.error("Invalid XML");
              prompt("Invalid XML");
              return;
            }
        }
        const createLocalEntryParams: CreateLocalEntryRequest = {
            directory: projectDir,
            name: localEntry.name,
            type: localEntry.type,
            value: localEntry.type === "In-Line XML Entry" ? localEntry.inLineXmlValue : localEntry.inLineTextValue,
            URL: localEntry.sourceURL,
        };
        const file = await rpcClient
            .getMiDiagramRpcClient()
            .createLocalEntry(createLocalEntryParams);
        openOverview();    
    };

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }
  
    const handleCancel = () => {
        rpcClient.getMiDiagramRpcClient().closeWebView();
    };
  
    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }
    
    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };
  
    const isValid: boolean =
        localEntry.name.length > 0 &&
        localEntry.type.length > 0 &&
        (!(localEntry.type === "In-Line Text Entry") || localEntry.inLineTextValue.length > 0) &&
        (!(localEntry.type === "Source URL Entry") || localEntry.sourceURL.length > 0) &&
        (!(localEntry.type === "In-Line XML Entry") || localEntry.inLineXmlValue.length > 0);
    
    return (
      <WizardContainer>
          <SectionWrapper>
              <Container>
                  <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                  <div style={{ marginLeft: 30 }}>
                      <Typography variant="h3">{isNewTask?"Create Local Entry Artifact":`${localEntry.name}:Local Entry`}</Typography>
                  </div>
              </Container>        
              <TextField
                  value={localEntry.name}
                  id="name-input"
                  label="Local Entry Name"
                  placeholder="Name"
                  validationMessage="LocalEntry name is required"
                  onChange={(text: string) => handleLocalEntryFieldChange("name", text)}
                  autoFocus
                  required
              />
              <span>Local Entry Creation Type</span>
              <AutoComplete
                  items={localEntryTypes}
                  selectedItem={localEntry.type}
                  onChange={(value: string) => handleLocalEntryFieldChange("type", value)}
                  sx={{ width: "100%" }}
              ></AutoComplete>
              <h5>Advanced Configuration</h5>
              {localEntry.type === "In-Line Text Entry" && (
                  <TextField
                      placeholder="Value"
                      label="Value"
                      onChange={(text: string) => handleLocalEntryFieldChange("inLineTextValue", text)}
                      value={localEntry.inLineTextValue}
                      id="value-input"
                      size={100}
                      required
                  />
              )}
              {localEntry.type === "In-Line XML Entry" && (
                  <CodeMirror
                      value={localEntry.inLineXmlValue}
                      extensions={[xml(), linter(() => errors)]}
                      theme={oneDark}
                      onChange={(text: string) => handleXMLInputChange(text)}
                      height="200px"
                      formatOnPaste
                      autoFocus
                  />
              )}
              {localEntry.type === "Source URL Entry" && (
                  <>
                      <div style={{ display: "flex", alignItems: "center" }}>
                          <TextField
                              placeholder="URL"
                              label="URL"
                              onChange={(text: string) => handleLocalEntryFieldChange("sourceURL", text)}
                              value={localEntry.sourceURL}
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
              <span style={{ color: message.isError ? "red" : "green" }}>{message.text}</span>
              <Button appearance="secondary" onClick={handleCancel}>
                  Cancel
              </Button>
              <Button
                  appearance="primary"
                  onClick={handleCreateLocalEntry}
                  disabled={message.isError}
              >
                  {isNewTask ? "Create" : "Update"}
              </Button>
          </ActionContainer>
      </WizardContainer>
    );
}
