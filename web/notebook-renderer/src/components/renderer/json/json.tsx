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
import ReactJson from "react-json-view";
import { NotebookCellResult } from "../types";

export const Json: FunctionComponent<{ notebookCellOutput: Readonly<NotebookCellResult> }> = ({ notebookCellOutput }) => {    
    const renderJson = (value: Object) => {
        return <ReactJson
            src={value}
            name={false}
            enableClipboard={false}
            // displayObjectSize={false}
            // displayDataTypes={false}
            theme="monokai"
            style={{
                fontWeight: "bold",
                fontFamily: "monospace",
                letterSpacing: "1px",
                padding: 24,
                minHeight: 180
            }}
        />
    }
    return <div>{renderJson(JSON.parse(notebookCellOutput.shellValue.value))}</div>;
}
