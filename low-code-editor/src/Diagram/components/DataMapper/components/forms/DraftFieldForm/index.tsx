/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React, { useContext, useState } from 'react';

import { IconButton, TextField } from '@material-ui/core';
import { Check, Close } from '@material-ui/icons';

import { createPropertyStatement, updatePropertyStatement } from '../../../../../../Diagram/utils/modification-util';
import { DiagramOverlay, DiagramOverlayContainer } from "../../../../Portals/Overlay";
import { Context as DataMapperContext } from '../../../context/DataMapperViewContext';
import { DraftFieldViewstate } from "../../../viewstate/draft-field-viestate";

import { AttributeTypeSelectButton } from './buttons/AttributeTypeSelectButton';
import { ObjectTypeSelectButton } from './buttons/ObjectTypeSelectButton';
import './style.scss';

export enum JsonFieldTypes {
    OBJECT,
    ATTRIBUTE
}

interface DraftFieldFormProps {
    onDraftCancel: () => void;
    draftFieldViewState: DraftFieldViewstate;
    offSetCorrection: number;
}

export function DraftFieldForm(props: DraftFieldFormProps) {
    const { state: { dispatchMutations } } = useContext(DataMapperContext);
    const { draftFieldViewState, onDraftCancel, offSetCorrection } = props;

    // const [selectedFieldType, setSelectedFieldType] = useState<JsonFieldTypes>(JsonFieldTypes.ATTRIBUTE);
    const [fieldName, setFieldName] = useState<string>('');

    const onFieldTypeBtnClick = (type: JsonFieldTypes) => {
        // setSelectedFieldType(type);
    }

    const onFieldNameChange = (evt: any) => {
        setFieldName(evt.target.value);
    }

    const handleOnSave = () => {
        let statementString: string = '';

        if (!draftFieldViewState.precededByComma) {
            statementString += ',';
        }

        statementString += fieldName;

        switch (draftFieldViewState.fieldType) {
            case JsonFieldTypes.ATTRIBUTE:
                statementString += ': ""';
                break;
            case JsonFieldTypes.OBJECT:
                statementString += ': {}'
                break;
            default:
            // ignored
        }

        const modificationStatement = updatePropertyStatement(statementString, draftFieldViewState.NodePosition);

        dispatchMutations([modificationStatement]);
    }

    return (
        <DiagramOverlayContainer>
            <DiagramOverlay
                position={{ x: draftFieldViewState.bBox.x, y: draftFieldViewState.bBox.y - 10 }}
                stylePosition='absolute'
            >
                <div data-testid={'datamapper-json-draft-field-form-wrapper'} style={{ width: draftFieldViewState.bBox.w - offSetCorrection, padding: '0 5px 0 5px' }}>
                    <div data-testid={'datamapper-json-draft-field-form'} id="draft-field-form" className='draft-field-form'>
                        <div data-testid={'datamapper-json-draft-field-form-input-wrapper'} className='draft-field-input'>
                            <TextField
                                data-testid={'datamapper-json-draft-field-form-txt'}
                                value={fieldName}
                                variant="standard"
                                placeholder="Field Name"
                                helperText={""}
                                autoFocus={true}
                                onChange={onFieldNameChange}
                            />
                        </div>
                    </div>
                    <div className='draft-field-submit'>
                        <IconButton data-testid={'datamapper-json-draft-field-check-btn'} size="small" disabled={fieldName.length === 0} onClick={handleOnSave} >
                            <Check />
                        </IconButton>
                        <IconButton data-testid={'datamapper-json-draft-field-cancel-btn'} size="small" onClick={onDraftCancel} >
                            <Close />
                        </IconButton>
                    </div>
                </div>
            </DiagramOverlay>
        </DiagramOverlayContainer>
    );
}
