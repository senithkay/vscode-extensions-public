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
import { useEffect, useState } from 'preact/hooks';
import { NotebookCellResult } from "../types";

interface TableProps {
    header: string[];
    values: Object[];
}

export const Table: FunctionComponent<{ tableContent: Readonly<TableProps> }> = ({ tableContent }) => {
    const tableContentValues = tableContent.values;
    const getValue = (element: { [x: string]: any; }, key: string | number) => element[key] ? JSON.stringify(element[key], undefined, 2) : '';
    const renderHeader = () => {
        return tableContent.header.map((key) => {
            return <th key={key}>{key.toUpperCase()}</th>;
        });
    };
    const renderBody = () => {
        let body: h.JSX.Element[] = [];
        for (let index = 0; index < tableContentValues.length; index++) {
            body.push(
                <tr>{ tableContent.header.map( key =>{ return <td><pre>{getValue(tableContentValues[index], key)}</pre></td>; }) }</tr>
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

export const TableForNotebookOutput: FunctionComponent<{ notebookCellOutput: Readonly<NotebookCellResult> }> = ({ notebookCellOutput }) => {
    const values = JSON.parse(notebookCellOutput.shellValue.value);
    const getKeys = () => Object.keys(values[0]);
    const tableProps = {
        header: getKeys(),
        values: values
    };
    return <Table tableContent={tableProps} />;
}

export interface VariableViewProps {
    getVariableValues: () => Promise<any>;
}

export const TableForVariableView: FunctionComponent<{ props: Readonly<VariableViewProps> }> = ({ props }) => {
    const [tableProps, setTableProps] = useState({
        header:["Name", "Type", "Value"],
        values: [{}]
    });
    useEffect(() => {
        props.getVariableValues().then((vals) => {
            return setTableProps({
                ...tableProps,
                values: vals
            });
        });
    });
    return <Table tableContent={tableProps} />
}
