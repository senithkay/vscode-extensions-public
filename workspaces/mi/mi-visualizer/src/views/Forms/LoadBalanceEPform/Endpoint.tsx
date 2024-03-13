/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Dropdown, TextField, Codicon } from "@wso2-enterprise/ui-toolkit";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";

const Endpoint = ({ endpoint, handleEndpointChange, handleSave, onDeleteClick, index, last }: any) => {
    const [codemirrorErrors, setCodemirrorErrors] = useState<any[]>([]);
    const [changesOccured, setChangesOccured] = useState<boolean>(false);
    const [tempEndpoint, setTempEndpoint] = useState<any>(endpoint);

    useEffect(() => {
        setChangesOccured(JSON.stringify(endpoint) !== JSON.stringify(tempEndpoint));
    }, [tempEndpoint, endpoint]);

    const endpointTypes = [
        { content: 'INLINE', value: 'inline' },
        { content: 'STATIC', value: 'static' },
    ];

    const handleChanges = (field: string, value: any) => {
        const newEndpoint = { ...tempEndpoint, [field]: value };
        setTempEndpoint(newEndpoint);
        setChangesOccured(false);

        if (!last) {
            handleEndpointChange(field, value);
        }
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `1fr 4fr ${handleEndpointChange ? '0.2fr' : ''} ${onDeleteClick ? '0.2fr' : ''}`,
            alignItems: 'start',
            justifyContent: 'center',
            gap: 20,
            marginTop: last !== undefined ? 0 : 10,
            paddingBottom: last !== undefined ? index === last ? 0 : 10 : 0,
            borderBottom: last !== undefined ? (index === last) ? 0 : "1px solid #e0e0e0" : 0,
        }}>
            <Dropdown
                id="endpoint-type"
                value={tempEndpoint.type}
                onChange={(text: string) => handleChanges("type", text)}
                items={endpointTypes}
            />
            {tempEndpoint.type === "static" ? (
                <TextField
                    id='endpoint-value'
                    value={tempEndpoint.value}
                    onChange={(text: string) => handleChanges("value", text)}
                    sx={{ marginTop: '-2px' }}
                />
            ) : (
                <div style={{
                    overflowX: 'scroll',
                    marginTop: '2px',
                }}>
                    <CodeMirror
                        value={tempEndpoint.value}
                        extensions={[xml(), linter(() => codemirrorErrors)]}
                        theme={oneDark}
                        onChange={(text: string) => handleChanges("value", text)}
                        maxHeight="200px"
                    />
                </div>
            )}
            {handleEndpointChange && <Codicon
                iconSx={{ marginTop: 5, fontSize: 18 }}
                sx={{ opacity: (changesOccured || (index === undefined)) ? 1 : 0.2, cursor: (changesOccured || (index === undefined)) ? 'pointer' : 'not-allowed' }}
                name='plus'
                onClick={() => handleSave !== undefined ? handleSave() : handleEndpointChange(index, tempEndpoint)}
            />}
            {onDeleteClick && <Codicon iconSx={{ marginTop: 5, fontSize: 18 }} name='trash' onClick={() => onDeleteClick(index)} />}
        </div>
    )
}

export default Endpoint;
