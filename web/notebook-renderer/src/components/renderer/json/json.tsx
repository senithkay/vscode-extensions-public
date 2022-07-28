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

import { h, FunctionComponent } from "preact";
import ReactJson, { ThemeKeys, ThemeObject } from "react-json-view";
import { DEFAULT_FONT_STYLE, JSON_DARK_THEME, JSON_LIGHT_THEME } from "../themes";
import { NotebookCellResult } from "../types";
import { getIsDarkMode } from "../utils";

export const JsonForNotebookOutput: FunctionComponent<{
    notebookCellOutput: Readonly<NotebookCellResult>
}> = ({ notebookCellOutput }) => {
    const darkMode = getIsDarkMode();
    return <div style={{
        maxHeight: "600px",
        overflowY: "scroll"
    }}>
        <Json
            value={JSON.parse(notebookCellOutput.shellValue.value)}
            theme={darkMode ? JSON_DARK_THEME : JSON_LIGHT_THEME}
            collapsed={3}
        />
    </div>;
}

export const Json: FunctionComponent<{
    value: Object, theme: ThemeObject | ThemeKeys, styles?: Object, collapsed?: number
}> = ({ value, theme, styles, collapsed }) => {
    return <ReactJson
        src={value}
        name={false}
        enableClipboard={false}
        displayDataTypes={false}
        groupArraysAfterLength={20}
        theme={theme}
        collapsed={collapsed ?? false}
        style={{
            padding: 24,
            ...DEFAULT_FONT_STYLE,
            ...styles
        }} />;
}
