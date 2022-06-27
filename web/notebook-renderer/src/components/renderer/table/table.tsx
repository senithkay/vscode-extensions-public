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
import { Json } from "../json/json";
import { DEFAULT_FONT_STYLE, JSON_DARK_THEME, JSON_LIGHT_THEME } from "../themes";
import { NotebookCellResult } from "../types";
import { getIsDarkMode } from "../utils";

interface TableProps {
    header: string[];
    values: Object[];
}

export const Table: FunctionComponent<{
    tableContent: Readonly<TableProps>
}> = ({ tableContent }) => {
    const darkMode = getIsDarkMode();
    const tableContentValues = tableContent.values;
    const getValue = (element: { [x: string]: any }, key: string | number) =>
        element[key] ?? null;

    const renderHeader = () => {
        return tableContent.header.map((key) => {
            return (
                <th key={key} style={{ textAlign: "center", letterSpacing: "0.05em" }}>
                    {key}
                </th>
            );
        });
    };

    const renderBody = () => {
        let body: h.JSX.Element[] = [];
        for (let index = 0; index < tableContentValues.length; index++) {
            body.push(
                <tr>
                    {tableContent.header.map((key) => {
                        let value = getValue(tableContentValues[index], key);
                        return (
                            <td style={{ textAlign: "left" }} >
                                {value === Object(value) ? (
                                    <Json
                                        value={value}
                                        theme={darkMode ? JSON_DARK_THEME : JSON_LIGHT_THEME}
                                        collapsed={1}
                                    />
                                ) : (
                                    value != null && (
                                        <pre>{JSON.stringify(value, undefined, 2)}</pre>
                                    )
                                )}
                            </td>
                        );
                    })}
                </tr>
            );
        }
        return body;
    };

    const renderTable = () => {
        return (
            <table>
                <thead>{renderHeader()}</thead>
                <tbody>{renderBody()}</tbody>
            </table>
        );
    };
    return <div>{renderTable()}</div>;
};

export const TableForNotebookOutput: FunctionComponent<{
    notebookCellOutput: Readonly<NotebookCellResult>;
}> = ({ notebookCellOutput }) => {
    const values = JSON.parse(notebookCellOutput.shellValue.value);

    if (!values.length) {
        return <p style={{ ...DEFAULT_FONT_STYLE, textAlign: "left" }}>Empty table!</p>;
    }

    const getKeys = () => {
        let cols = [];
        for (var i = 0; i < values.length; i++) {
            for (var key in values[i]) {
                if (cols.indexOf(key) === -1) {
                    cols.push(key);
                }
            }
        }
        return cols;
    };

    const tableProps = {
        header: getKeys(),
        values: values,
    };
    return (
        <div
            style={{
                ...DEFAULT_FONT_STYLE,
                maxHeight: "600px",
                overflowY: "scroll",
            }}
        >
            <Table tableContent={tableProps} />
        </div>
    );
};
