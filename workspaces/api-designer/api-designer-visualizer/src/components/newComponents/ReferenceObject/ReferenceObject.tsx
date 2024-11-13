/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Dropdown, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { ReferenceObject as R } from '../../../Definitions/ServiceDefinitions';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../NewAPIDesignerContext';

const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

interface ReferenceObjectsProps {
    id: number;
    referenceObject: R;
    referenceObjects?: string[];
    onRemoveReferenceObject?: (id: number) => void;
    onRefernceObjectChange: (parameter: R) => void;
}
const ButtonWrapperParams = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 40px;
    flex-grow: 1;
    gap: 5px;
    justify-content: flex-end;
`;
export function ReferenceObject(props: ReferenceObjectsProps) {
    const { id, referenceObject, referenceObjects, onRemoveReferenceObject, onRefernceObjectChange } = props;
    const { 
        props: { components },
    } = useContext(APIDesignerContext); 

    const handleParameterChange = (parameter: R) => {
        onRefernceObjectChange(parameter);
    };

    const referenceObjectsList = referenceObjects ? referenceObjects?.map((item) => ({ value: item, label: item })) : 
        components?.map((item) => ({ value: item, label: item }));

    return (
        <HorizontalFieldWrapper>
            <Dropdown
                id={`paramType-${referenceObject.$ref}`}
                value={referenceObject.$ref}
                containerSx={{ width: "35%" }}
                items={referenceObjectsList}
                onValueChange={(value) => handleParameterChange({ ...referenceObject, $ref: value })}
            />
            <TextField
                id={`paramName-${referenceObject.summary}`}
                placeholder="Summary"
                value={referenceObject.summary}
                sx={{ width: "25%" }}
                onBlur={(evt) => handleParameterChange({ ...referenceObject, summary: evt.target.value })}
            />
            <TextField
                id={`paramName-${referenceObject.description}`}
                placeholder="Description"
                value={referenceObject.description}
                sx={{ width: "40%" }}
                onBlur={(evt) => handleParameterChange({ ...referenceObject, description: evt.target.value })}
            />
                <ButtonWrapperParams>
                    <Button appearance='icon' onClick={() => onRemoveReferenceObject(id)}>
                        <Codicon name="trash" />
                    </Button>
                </ButtonWrapperParams>
            </HorizontalFieldWrapper>
    )
}
