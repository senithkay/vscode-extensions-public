/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import React, { useEffect, useState } from "react";
import { VisualizerLocation, CreateProjectRequest } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import {TextArea, Button, Switch} from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import './AIWindow.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { BeatLoader } from "react-spinners";
import { MI_COPILOT_BACKEND_URL } from "../../constants";
import { AIProjectGenerationChat } from "../AIProjectGenerationChat";
import { AIChat } from "../AIChat";




export function AIArtifactWindow() {
  const [isChat, setIsChat] = useState(false);

  const toggleFlow = () => {
    setIsChat(!isChat);
  };

  

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "98%", width: "100%", margin: "auto" }}>

      <Switch
          leftLabel="Edit with AI"
          rightLabel="MI Copilot Chat"
          checked={isChat}
          checkedColor="var(--vscode-button-background)"
          enableTransition={true}
          onChange={toggleFlow}
          sx={{
            "margin": "auto",
            fontFamily: "var(--font-family)",
            fontSize: "var(--type-ramp-base-font-size)",
          }}
        />


       
      
        
        {!isChat && (
           <AIProjectGenerationChat/>
        )}

        {isChat && (
          <AIChat/>
        )}



    </div>
  );
}
