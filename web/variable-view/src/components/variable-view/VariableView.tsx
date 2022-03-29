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

import React, { useState } from 'react';
import { useEffect } from 'react';

interface TableProps {
    header: string[];
    values: Object[];
}

export const Table = ({ header, values }: TableProps): JSX.Element => {
    const darkMode = document.body.getAttribute('data-vscode-theme-kind')?.includes('dark') ?? false;
    const tableContentValues = values;
    const getValue = (element: { [x: string]: any; }, key: string | number) => element[key] ? JSON.stringify(element[key], undefined, 2) : '';
    const renderHeader = () => {
        return header.map((key) => {
            return <th key={key}>{key.toUpperCase()}</th>;
        });
    };
    const renderBody = () => {
        let body: JSX.Element[] = [];
        for (let index = 0; index < tableContentValues.length; index++) {
            body.push(
                <tr>{ header.map( (key: string | number) =>{ return <td><pre>{getValue(tableContentValues[index], key)}</pre></td>; }) }</tr>
            );
        }
        return body;
    };
    const renderTable = () => {
        return <table>
                <thead>{ renderHeader() }</thead>
                <tbody>{ renderBody() }</tbody>
            </table>;
    };
    return <div>{ renderTable() }</div>;
};

export interface VariableViewProps {
    getVariableValues: () => Promise<Object[]>;
}

export const VariableView = ({ getVariableValues }: VariableViewProps): JSX.Element => {
    const header = ["name", "type", "value"];
    const [tableProps, setTableProps] = useState({
        values: [{}]
    });
    const updateVals = () => {        
        getVariableValues().then((vals) => {
            return setTableProps({
                values: vals
            });
        });
    }
    useEffect(() => {
        updateVals();
    });
    return <Table header={header} values={tableProps.values}  />
}
