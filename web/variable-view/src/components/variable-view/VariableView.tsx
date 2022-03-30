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

import "./style.css";

interface TableProps {
    header: string[];
    values: VariableValue[];
}

export interface VariableValue{
    name: string;
    type: string;
    value: string;
}

export interface VariableViewProps {
    getVariableValues: () => Promise<VariableValue[]>;
}

export const Table = ({ header, values }: TableProps): JSX.Element => {
    const tableContentValues = values;
    const getValue = (element: { [x: string]: any; }, key: string | number) => element[key] ? element[key] : '';
    const renderHeader = () => {
        return header.map((key) => {
            return <th key={key} data-key={key}>{key.toUpperCase()}</th>;
        });
    };
    const renderBody = () => {
        let body: JSX.Element[] = [];
        for (let index = 0; index < tableContentValues.length; index++) {
            body.push(
                <tr key={tableContentValues[index].name}>{ header.map( (key: string) =>{ 
                    return <td className='table-data' data-key={key}>
                        <span className='actual-value'>{getValue(tableContentValues[index], key)}</span>
                        <span className='tooltip-text'>{getValue(tableContentValues[index], key)}</span>
                        </td>; 
                }) }</tr>
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

export const VariableView = ({ getVariableValues }: VariableViewProps): JSX.Element => {
    const header = ["name", "type", "value"];
    const message = "No variables defined";
    const [tableValues, setTableValues] = useState([{
        name: message,
        type: '',
        value: ''
    }]);
    const updateVals = () => {        
        getVariableValues().then((vals) => {
            return setTableValues(vals.sort((val1, val2) => val1.name.localeCompare(val2.name)));
        });
    }
    useEffect(() => {
        updateVals();
    }, []);
    return <div id="variables-view" className="variables-view">
            <Table header={header} values={tableValues} /> 
        </div>;
}
