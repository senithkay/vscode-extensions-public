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
import { NotebookCellResult } from "../types";
import { typeOf } from "../utils";

interface GraphProps {
    keys: string[];
    yKeys: string[];
    values: Object[];
}

export const Graph: FunctionComponent<{ graphContent: Readonly<GraphProps> }> = ({ graphContent }) => {
    console.log(graphContent);
    
    return <div></div>;
};
 
export const GraphForNotebookOutput: FunctionComponent<{ notebookCellOutput: Readonly<NotebookCellResult> }> = ({ notebookCellOutput }) => {
    const values = JSON.parse(notebookCellOutput.shellValue.value);

    if (!values.length) {
        return <p>No data to provide a graph!</p>
    }

    const getGraphContent = () => {
        var keys = [];
        let typeofKey = new Map<string, string>();
        for (var i = 0; i < values.length; i++) {
            for (var key in values[i]) {
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    typeofKey.set(key, typeOf(values[i][key]))
                }
            }
        }
        // we can only render numbers in y Axis, others do not make any sense
        // yKeys holds key names appopriate for y Axis
        let yKeys = [];
        for (let key of typeofKey.keys()) {
            if (typeofKey.get(key) === "number") {
                yKeys.push(key);
            }
        }
        return {keys, yKeys, values};
    }
    
    const graphContent = getGraphContent();
    return <Graph graphContent={graphContent} />;
}
 