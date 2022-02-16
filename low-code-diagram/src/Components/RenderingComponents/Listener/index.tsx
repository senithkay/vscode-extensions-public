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
import React, { useContext, useState } from 'react'

import { DeleteButton, EditButton, ListenerIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { ListenerDeclaration, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from '../../../Context/diagram';

import "./style.scss";

// import Tooltip from '../../../../../../components/Tooltip';

export const LISTENER_MARGIN_LEFT: number = 24.5;
export const LISTENER_PLUS_OFFSET: number = 7.5;

export interface ListenerProps {
    model: STNode;
}

export function ListenerC(props: ListenerProps) {
    const { model } = props;
    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;
    const deleteComponent = diagramContext?.api?.edit?.deleteComponent;
    const renderEditForm = diagramContext?.api?.edit?.renderEditForm;
    const gotoSource = diagramContext?.api?.code?.gotoSource;
    const [isEditable, setIsEditable] = useState(false);
    // const [editingEnabled, setEditingEnabled] = useState(false);

    const listenerModel: ListenerDeclaration = model as ListenerDeclaration;
    const listenerName = listenerModel.variableName.value;
    const listenerType = listenerModel.typeDescriptor.modulePrefix.value;
    let listenerPort = "";
    listenerModel.initializer.parenthesizedArgList?.arguments.forEach((argument) => {
        listenerPort += argument.source?.trim();
    });
    const typeMaxWidth = listenerType.length >= 10;
    const nameMaxWidth = listenerName.length >= 20;

    const handleMouseEnter = () => {
        setIsEditable(true);
    };
    const handleMouseLeave = () => {
        setIsEditable(false);
    };

    const handleDeleteBtnClick = () => {
        deleteComponent(model);
    }

    const handleEditBtnClick = () => {
        renderEditForm(model, model.position, { formType: model.kind, isLoading: false });
    }

    return (
        <>
            <div
                className="listener-comp"
                data-listener-name={listenerName}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="listener-header">
                    <div className="listener-content">
                        <div className="listener-icon">
                            <ListenerIcon />
                        </div>
                        <div className="listener-type">
                            {/* <Tooltip
                                arrow={true}
                                placement="top-start"
                                title={model.source.slice(1, -1)}
                                inverted={false}
                                interactive={true}
                            > */}
                                <tspan x="0" y="0">{typeMaxWidth ? listenerType.slice(0, 10).toUpperCase() + "..." : listenerType.toUpperCase()}</tspan>
                            {/* </Tooltip> */}
                        </div>
                        <div className="listener-name">
                            <tspan x="0" y="0">{nameMaxWidth ? listenerName.slice(0, 20) + "..." : listenerName}</tspan>
                        </div>
                    </div>
                    { !isReadOnly && isEditable && (
                        <div className={"listener-amendment-options"}>
                            <div className={"edit-btn-wrapper"}>
                                <EditButton onClick={handleEditBtnClick} />
                            </div>
                            <div className={"delete-btn-wrapper"}>
                                <DeleteButton onClick={handleDeleteBtnClick} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export const Listener = ListenerC;

