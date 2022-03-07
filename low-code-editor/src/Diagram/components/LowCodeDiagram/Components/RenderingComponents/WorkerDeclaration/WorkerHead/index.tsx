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

import React, { useState } from "react";

import { NamedWorkerDeclaration } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../../Contexts/Diagram";
import { removeStatement } from "../../../../../../utils/modification-util";
import { FormGenerator } from "../../../../../FormComponents/FormGenerator";
import { WorkerDeclarationViewState } from "../../../../ViewState/worker-declaration";
import { DeleteBtn } from "../../../DiagramActions/DeleteBtn";
import { EditBtn } from "../../../DiagramActions/EditBtn";
import { StartSVG, START_SVG_HEIGHT, START_SVG_WIDTH } from "../../Start/StartSVG";

interface WorkerHeadProps {
    model: NamedWorkerDeclaration
}

export function WorkerHead(props: WorkerHeadProps) {
    const {
        api: {
            code: {
                modifyDiagram
            }
        },
        actions: {
            toggleDiagramOverlay
        }
    } = useDiagramContext();
    const { model } = props;
    const viewState: WorkerDeclarationViewState = model.viewState;
    const [isEditFormOpen, setEditFormOpen] = useState(false);

    const handleEditClick = () => {
        setEditFormOpen(!isEditFormOpen);
        toggleDiagramOverlay();
    }

    const onDeleteClick = () => {
        modifyDiagram([removeStatement(model.position)]);
    }

    const editButtons = (
        <g className="modification-buttons">
            <rect
                x={viewState.trigger.cx - START_SVG_WIDTH / 2}
                y={viewState.trigger.cy - START_SVG_HEIGHT / 4}
                width={START_SVG_WIDTH}
                height={START_SVG_HEIGHT / 2}
                rx={10}
                fill={"#D3D8FF"}
            />
            <DeleteBtn
                model={model}
                cx={viewState.trigger.cx}
                cy={viewState.trigger.cy - START_SVG_HEIGHT / 4}
                toolTipTitle={'Delete worker'}
                isReferencedInCode={false}
                onDraftDelete={onDeleteClick}
                showOnRight={true}
            />
            <EditBtn
                model={model}
                cx={viewState.trigger.cx - START_SVG_WIDTH / 4}
                cy={viewState.trigger.cy - START_SVG_HEIGHT / 4}
                onHandleEdit={handleEditClick}
            />
        </g>
    );

    const workerConfig = {
        formType: 'Worker',
        isLoading: false,
        formArgs: {
            model,
        },
    };


    const editForm = (
        <FormGenerator
            onCancel={handleEditClick}
            onSave={handleEditClick}
            configOverlayFormStatus={workerConfig}
        />
    );

    return (
        <g className="start-container">
            <StartSVG
                x={viewState.trigger.cx - (START_SVG_WIDTH / 2)}
                y={viewState.trigger.cy - (START_SVG_HEIGHT / 2)}
                text={model.workerName.value}
            />
            {editButtons}
            {isEditFormOpen && editForm}
        </g>
    )
}
