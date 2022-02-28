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
import { ShellOutput } from "./types";

export const Table: FunctionComponent<{ shellOutput: Readonly<ShellOutput> }> = ({ shellOutput }) => {
    const tableContentRegex = /^table key\(([a-zA-Z0-9, ]+)\) (\[.+\])$/;
    const match = shellOutput.shellValue.value.match(tableContentRegex)!;
    // const tableKeys = match[1].split(',');
    const tableContent = JSON.parse(match[2]);
    const getKeys = () => Object.keys(tableContent[0]);
    const getValue = (element: { [x: string]: any; }, key: string | number) => element[key] ? JSON.stringify(element[key], undefined, 2) : '';
    const renderHeader = () => {
        var keys = getKeys();
        return keys.map((key) => {
            return <th key={key}>{key.toUpperCase()}</th>;
        });
    }
    const renderBody = () => {
        var keys = getKeys();
        let body: h.JSX.Element[] = [];
        for (let index = 0; index < tableContent.length; index++) {
            body.push(
                <tr>{keys.map( key =>{return <td><pre style={'align:left'}>{getValue(tableContent[index], key)}</pre></td>})}</tr>
            );
        }
        return body;
    }
    const renderTable = () => {
        return <table>
                <thead>{renderHeader()}</thead>
                <tbody>{renderBody()}</tbody>
            </table>;
    };
    return <div>{renderTable()}</div>;
}