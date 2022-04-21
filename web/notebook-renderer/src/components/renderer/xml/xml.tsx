/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { h, FunctionComponent } from "preact";
// @ts-ignore
import XMLViewer from 'react-xml-viewer';
import { NotebookCellResult } from "../types";
 
export const Xml: FunctionComponent<{ notebookCellOutput: Readonly<NotebookCellResult> }> = ({ notebookCellOutput }) => {    
    const darkMode = document.body.getAttribute('data-vscode-theme-kind')?.includes('dark') ?? false;
    const darkTheme = {
        "attributeKeyColor": "#b46900",
        "attributeValueColor": "#dd6900",
        "cdataColor": "#22a21f",
        "commentColor": "#aaa",
        "separatorColor": "#d43900",
        "tagColor": "#d43900",
        "textColor": "#fff"
    };
    const lightTheme = {
        ...darkTheme,
        "textColor": "#000"
    }
    const renderXml = (xml: string) => {
        return <XMLViewer xml={xml} theme={darkMode ? darkTheme : lightTheme} />
    }
    return <div style={{
            fontFamily: "monospace",
            letterSpacing: "1px",
            padding: 24,
            maxHeight: "400px",
            overflowY: "scroll",
            backgroundColor: darkMode ? "#151515" : "transparent"
        }}>
            {renderXml(notebookCellOutput.shellValue.value)}
        </div>;
}
 