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
import React, { useState } from 'react';

import { ClassDefinition } from '@wso2-enterprise/syntax-tree';
import classNames from 'classnames';

import ClassIcon from '../../../../../../../assets/icons/ClassIcon';
import DeleteButton from '../../../../../../../assets/icons/DeleteButton';
import EditButton from '../../../../../../../assets/icons/EditButton';
import { useDiagramContext } from '../../../../../../../Contexts/Diagram';
import { removeStatement } from '../../../../../../utils/modification-util';
import { UnsupportedConfirmButtons } from '../../../../../FormComponents/DialogBoxes/UnsupportedConfirmButtons';
import { ComponentExpandButton } from '../../../../Components/ComponentExpandButton';
import { HeaderWrapper } from '../../../../HeaderWrapper';

interface ClassHeaderProps {
    model: ClassDefinition;
    onExpandClick: () => void;
    isExpanded: boolean;
}

export function ClassHeader(props: ClassHeaderProps) {
    const { model, onExpandClick, isExpanded } = props;
    const {
        api: {
            code: { modifyDiagram, gotoSource },
        },
    } = useDiagramContext();
    const [editingEnabled, setEditingEnabled] = useState(false);

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
        gotoSource({ startLine: targetposition.startLine, startColumn: targetposition.startColumn });
    }

    return (
        <HeaderWrapper
            className={'class-component-header'}
            onClick={onExpandClick}
        >
            <div className={'header-segement-container'}>
                <div className="header-segment" >
                    <ClassIcon />
                </div>
                <div className={"header-segment"}>Class</div>
                <div className={"header-segment-path"}>{model.className.value}</div>
            </div>
            <div className="class-amendment-options">
                <div className={classNames("class-component-edit", "show-on-hover")}>
                    <EditButton onClick={handleEditBtnClick} />
                </div>
                <div className={classNames("class-component-delete", "show-on-hover")}>
                    <DeleteButton onClick={handleDeleteBtnClick} />
                </div>
            </div>
            {editingEnabled && <UnsupportedConfirmButtons onConfirm={handleEditBtnConfirm} onCancel={handleEditBtnCancel} />}
        </HeaderWrapper>
    );
}
