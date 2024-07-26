/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Dropdown, TextField, Codicon } from "@wso2-enterprise/ui-toolkit";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter } from "@codemirror/lint";
import CodeMirror from "@uiw/react-codemirror";

const Container = styled.div({
    display: 'grid',
    alignItems: 'start',
    justifyContent: 'center',
    gap: 20,
}, (props: any) => ({
    gridTemplateColumns: '1fr 4fr ' + '0.2fr '.repeat(props["btn-count"]),
    marginTop: props["not-new"] ? 0 : 10,
    paddingBottom: props["not-new"] ? props["is-last"] ? 0 : 10 : 0,
    borderBottom: props["not-new"] ? props["is-last"] ? 0 : "1px solid #e0e0e0" : 0,
}));

const CodeMirrorContainer = styled.div({
    overflowX: 'scroll',
    marginTop: 2,
});

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
        <Container
            btn-count={Number((!!handleEndpointChange)) + Number((!!onDeleteClick))}
            not-new={last !== undefined}
            is-last={index === last}
        >
            <Dropdown
                id="endpoint-type"
                value={tempEndpoint.type}
                onValueChange={(text: string) => handleChanges("type", text)}
                items={endpointTypes}
            />
            {tempEndpoint.type === "static" ? (
                <TextField
                    id='endpoint-value'
                    value={tempEndpoint.value}
                    onTextChange={(text: string) => handleChanges("value", text)}
                    sx={{ marginTop: '-2px' }}
                />
            ) : (
                <CodeMirrorContainer>
                    <CodeMirror
                        value={tempEndpoint.value}
                        extensions={[xml(), linter(() => codemirrorErrors)]}
                        theme={oneDark}
                        onChange={(text: string) => handleChanges("value", text)}
                        maxHeight="200px"
                    />
                </CodeMirrorContainer>
            )}
            {handleEndpointChange && <Codicon
                iconSx={{ marginTop: 5, fontSize: 18 }}
                name='plus'
                onClick={() => handleSave !== undefined ? handleSave() : handleEndpointChange(index, tempEndpoint)}
                sx={{ opacity: (changesOccured || (index === undefined)) ? 1 : 0.2, cursor: (changesOccured || (index === undefined)) ? 'pointer' : 'not-allowed' }}
            />}
            {onDeleteClick && <Codicon iconSx={{ marginTop: 5, fontSize: 18 }} name='trash' onClick={() => onDeleteClick(index)} />}
        </Container>
    )
}

export default Endpoint;
