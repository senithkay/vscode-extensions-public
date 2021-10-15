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
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useState } from 'react';

import { ClassDefinition } from '@ballerina/syntax-tree';

import ClassIcon from '../../../../assets/icons/ClassIcon';
import DeleteButton from '../../../../assets/icons/DeleteButton';
import EditButton from '../../../../assets/icons/EditButton';
import { Context as DiagramContext } from '../../../../Contexts/Diagram';
import { removeStatement } from '../../../utils/modification-util';
import { ComponentExpandButton } from '../../ComponentExpandButton';
import { UnsupportedConfirmButtons } from '../../UnsupportedConfirmButtons';

interface ClassHeaderProps {
    model: ClassDefinition;
    onExpandClick: () => void;
    isExpanded: boolean;
}

export function ClassHeader(props: ClassHeaderProps) {
    const { model, onExpandClick, isExpanded } = props;
    const {
        props: {
            stSymbolInfo
        },
        api: {
            code: {
                modifyDiagram
            }
        }
    } = useContext(DiagramContext);
    const [editingEnabled, setEditingEnabled] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };

    const handleDeleteBtnClick = () => {
        modifyDiagram([
            removeStatement(model.position)
        ]);
    }

    const handleEditBtnClick = () => {
        setEditingEnabled(true);
    }

    const handleEditBtnCancel = () => {
        setEditingEnabled(false);
    }

    const handleEditBtnConfirm = () => {
        const targetposition = model.position;
        setEditingEnabled(false);
        // Move to code
    }

    return (
        <div className={'class-component-header'} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className={'header-segement-container'}>
                <div className="header-segment" >
                    <ClassIcon />
                </div>
                <div className="header-segment">
                    {model.className.value}
                </div>
            </div>
            {isEditable && (
                <div className="class-amendment-options">
                    <div className="class-component-edit">
                        <EditButton onClick={handleEditBtnClick} />
                    </div>
                    <div className="class-component-delete">
                        <DeleteButton onClick={handleDeleteBtnClick} />
                    </div>
                </div>
            )}
            <ComponentExpandButton isExpanded={isExpanded} onClick={onExpandClick} />
            {editingEnabled && <UnsupportedConfirmButtons onConfirm={handleEditBtnConfirm} onCancel={handleEditBtnCancel} />}
        </div >
    );
}
