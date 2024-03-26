/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { TextField, Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import PropTable from "./PropTable";
import { useState } from "react";

const Container = styled.div`
    padding: 15px 30px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
`;

const ClassName = styled.div({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
});

const TitleBar = styled.div({
    display: 'grid',
    gridTemplateColumns: '1fr 20px 20px 20px 60px 110px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
});

const Handler = ({ id, last, handler, setHandlers }: any) => {
    const [showProps, setShowProps] = useState(false);

    const onClassNameChange = (text: string) => {
        setHandlers((handlers: any) => {
            const newHandlers = [...handlers];
            newHandlers[id] = { ...newHandlers[id], name: text };
            return newHandlers;
        });
    }

    const moveUp = () => {
        if (id === 0) return;
        setHandlers((handlers: any) => {
            const newHandlers = [...handlers];
            const temp = newHandlers[id];
            newHandlers[id] = newHandlers[id - 1];
            newHandlers[id - 1] = temp;
            return newHandlers;
        });
    }

    const moveDown = () => {
        if (id === last) return;
        setHandlers((handlers: any) => {
            const newHandlers = [...handlers];
            const temp = newHandlers[id];
            newHandlers[id] = newHandlers[id + 1];
            newHandlers[id + 1] = temp;
            return newHandlers;
        });
    }

    const onHandlerDelete = () => {
        setHandlers((handlers: any) => {
            const newHandlers = [...handlers];
            newHandlers.splice(id, 1);
            return newHandlers;
        });
    }

    const onPropertyAdd = () => {
        setShowProps(true);

        if (handler.properties.length === 0) {
            setHandlers((handlers: any) => {
                const newHandlers = [...handlers];
                newHandlers[id].properties.push({ name: '', value: '' });
                return newHandlers;
            });
            return;
        }

        const lastProp = handler.properties[handler.properties.length - 1];
        if (lastProp.name === '' || lastProp.value === '') return;

        setHandlers((handlers: any) => {
            const newHandlers = [...handlers];
            newHandlers[id].properties.push({ name: '', value: '' });
            return newHandlers;
        });
    }

    const onPropertiesChange = (properties: []) => {
        setHandlers((handlers: any) => {
            const newHandlers = [...handlers];
            newHandlers[id] = { ...newHandlers[id], properties: properties };
            return newHandlers;
        });
    }

    return (
        <Container>
            <TitleBar>
                <ClassName>
                    <b>Class Name</b>
                    <TextField
                        id='class-name'
                        value={handler.name}
                        placeholder="Class name"
                        onTextChange={(text: string) => onClassNameChange(text)}
                        sx={{ flexGrow: 1 }}
                    />
                </ClassName>
                <Codicon iconSx={{ fontSize: 18 }} name='arrow-down' onClick={moveDown} />
                <Codicon iconSx={{ fontSize: 18 }} name='arrow-up' onClick={moveUp} />
                <Codicon iconSx={{ fontSize: 18 }} name='trash' onClick={onHandlerDelete} />
                <Button
                    appearance="secondary"
                    onClick={() => setShowProps(!showProps)}
                >
                    {showProps ? "Hide" : "Show"}
                </Button>
                <Button
                    appearance="primary"
                    onClick={onPropertyAdd}
                >
                    Add Property
                </Button>
            </TitleBar>
            {showProps && <PropTable classId={id} properties={handler.properties} onPropertiesChange={onPropertiesChange} />}
        </Container>
    )
}

export default Handler;
