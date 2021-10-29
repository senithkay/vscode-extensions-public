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
import React, { useContext, useEffect, useState } from "react";

import { STNode } from "@ballerina/syntax-tree";
import Button from '@material-ui/core/Button';
import classNames from "classnames";

import ComponentCollapseIcon from "../../../assets/icons/ComponentCollapseIcon";
import ComponentExpandIcon from "../../../assets/icons/ComponentExpandIcon";
import { useDiagramContext } from "../../../Contexts/Diagram";
import { DiagramOverlayContainer } from "../Portals/Overlay";

import "./style.scss";

export function UndoPanel() {
    const {
        api: {
            undoRedoPanel: {
                undoDiagram,
                redoDiagram,
                undoLength,
                redoLength
            }
        },
    } = useDiagramContext();

    const [undoDisabled, setUndoDisabled] = useState<boolean>(true);
    const [redoDisabled, setRedoDisabled] = useState<boolean>(false);

    // const undoqueue: STNode[] = [];
    // const redoqueue: STNode[] = [];
    // const {
    //     actions: {
    //         diagramCleanDraw
    //     },
    //     props: {
    //         syntaxTree
    //     }
    // } = useContext(Context);

    useEffect(() => {
        if (undoLength === 0) {
            setUndoDisabled(true);
        } else {
            setUndoDisabled(false)
        }

        if (redoLength === 0) {
            setRedoDisabled(true);
        } else {
            setRedoDisabled(false)
        }
    }, [undoLength, redoLength]);

    const handleUndoClick = () => {
        if (undoLength !== 0) {
            undoDiagram();
        //     redoqueue.push(currentSTNode);
        //     const lastST = undoqueue.pop();
        //     setCurrentSTNode(lastST);
        //     diagramCleanDraw(currentSTNode);
        }
    }

    const handleRedoClick = () => {
        if (redoLength !== 0) {
            redoDiagram();
        // if (redoqueue.length !== 0) {
        //     undoqueue.push(currentSTNode);
        //     const lastUndo = redoqueue.pop();
        //     setCurrentSTNode(lastUndo);
        //     diagramCleanDraw(currentSTNode);
        }
    }

    // const handleModification = (newST: STNode) => {
    //     undoqueue.push(currentSTNode);
    //     setCurrentSTNode(newST);
    // }

    return (
        <div>
            <DiagramOverlayContainer>
                <div className="undo-panel">
                    {/* <div className="close-btn-wrap">
                        <ButtonWithIcon
                            className="panel-close-button"
                            onClick={onClose}
                            icon={<CloseRounded fontSize="small" />}
                        />
                    </div>
                    <div className="panel-form-wrapper">
                        {children}
                    </div> */}
                    <div className={classNames("amendment-option", "undo")} onClick={handleUndoClick}>
                        <Button disabled={undoDisabled}>
                            <ComponentExpandIcon />
                        </Button>
                    </div>
                    <div className={classNames("amendment-option", "redo")} onClick={handleRedoClick} >
                        <Button disabled={redoDisabled}>
                            <ComponentCollapseIcon />
                        </Button>
                    </div>
                </div>
            </DiagramOverlayContainer>
        </div>
    );
}
