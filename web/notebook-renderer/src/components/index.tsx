/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { h, render } from 'preact';
import { ActivationFunction, OutputItem, RendererContext } from 'vscode-notebook-renderer';
import { MIME_TYPE_JSON, MIME_TYPE_TABLE, MIME_TYPE_XML } from './renderer/constants';
import { JsonForNotebookOutput } from './renderer/json/json';
import { TableForNotebookOutput } from './renderer/table/table';
import { getIsDarkMode } from './renderer/utils';
import { Xml } from "./renderer/xml/xml";

export const activate: ActivationFunction = (context: RendererContext<any>) => ({
    renderOutputItem(data: OutputItem, element) {
        try {
            switch (data.mime) {
                case MIME_TYPE_TABLE:
                    render(<TableForNotebookOutput notebookCellOutput={data.json()}/>, element);
                    break;
                case MIME_TYPE_JSON:
                    render(<JsonForNotebookOutput notebookCellOutput={data.json()}/>, element);
                    break;
                case MIME_TYPE_XML:
                    render(<Xml notebookCellOutput={data.json()}/>, element);
                    break;
                default:
                    break;
            }
        } catch {
            let match = data.text().match(/^{\n\t"shellValue": {\n\t\t"value": (?<value>.*),\n\t\t"mimeType": "/);
            const darkMode = getIsDarkMode();
            render(<div>
                <p style={darkMode ? {color: "rgb(244,135,113)"} : {color: "rgb(161, 38, 13)"}}>
                    Error in rendering output!
                </p>
                <p>{match?.groups ? match.groups.value : data.text()}</p>
            </div>, element);
        }
    }
});
