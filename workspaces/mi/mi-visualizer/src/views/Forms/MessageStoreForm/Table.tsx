/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { CustomParameter } from "./index";
import { Button } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    padding-bottom: 20px;
`;

type SampleTableProps = {
    rows: CustomParameter[];
    setRows: React.Dispatch<React.SetStateAction<CustomParameter[]>>;
};

const SampleTable: React.FC<SampleTableProps> = ({ rows, setRows }) => {
    const [editingCell, setEditingCell] = useState<{ rowId: number; cellId: string | null }>({
        rowId: -1,
        cellId: null,
    });
    const [rowOutput, setRowOutput] = useState<CustomParameter[]>([]);

    const addRow = () => {
        const newRow: CustomParameter = {
            name: 'Parameter',
            value: 'Value',
            selected: false,
        };
        setRows((prev: any) => [...prev, newRow]);
        setRowOutput([...rowOutput, newRow]);  
    };
    
    const removeSelectedRows = () => {
        setRows(rows.filter(row => !row.selected));
        setRowOutput(rowOutput.filter(row => !row.selected));
    };
    
    const toggleSelectRow = (id:number) => {
        setRows(
            rows.map((row, index) =>
                index === id ? { ...row, selected: !row.selected } : row.selected?{...row,selected:false}:row
            )
        );
    };
    
    const handleDoubleClick = (rowId: number, cellId: string) => {
        setEditingCell({ rowId, cellId });
    };
    
    const handleChange = (rowId: number, name: string, value: string) => {
        setRows(
            rows.map((row, index) =>
                index === rowId ? { ...row, [name]: value } : row
            )
        );
    };
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingTop: '20px',
            paddingBottom: '20px',
        }}>
            <ActionContainer>
                <Button appearance="secondary" onClick={addRow}>Add</Button>
                <Button appearance="secondary" onClick={removeSelectedRows}>Remove </Button>
            </ActionContainer>
            <table style={{
                maxHeight: '100px',
                overflow: 'auto',
                width: '60%',
                border: '1px solid black',
                contentAlign: 'left',
            }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} onClick={() => toggleSelectRow(index)} style={{ backgroundColor: row.selected ? 'blue' : index%2===0?'grey':'black' }}>
                            <td>{index + 1}</td>
                            <td onDoubleClick={() => handleDoubleClick(index, 'value1')}>
                                {editingCell.rowId === index && editingCell.cellId === 'value1' ? (
                                    <input
                                        type="text"
                                        value={row.name}
                                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                                        onBlur={() => setEditingCell({ rowId: -1, cellId: null })}
                                        autoFocus
                                        contentEditable={true}                    
                                    />
                                ) : (
                                    row.name
                                )}
                            </td>
                            <td onDoubleClick={() => handleDoubleClick(index, 'value2')}>
                                {editingCell.rowId === index && editingCell.cellId === 'value2' ? (
                                    <input
                                        type="text"
                                        value={row.value}
                                        onChange={(e) => handleChange(index, 'value', e.target.value)}
                                        onBlur={() => setEditingCell({ rowId: -1, cellId: null })}
                                        autoFocus
                                        contentEditable={true}
                                    />
                                ) : (
                                    row.value
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
                   };
export default SampleTable;
