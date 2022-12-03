/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useMemo, useReducer, useState } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STNode,
} from "@wso2-enterprise/syntax-tree";

// import { ServiceViewComponentView } from "@wso2-enterprise/ballerina-low-code-diagram";
import { Context } from "../../../Contexts/Diagram";
import { ResourceHeader } from "./ResourceHeader";
import { ServiceHeader } from "./ServiceHeader";
import classNames from "classnames";
import "./style.scss";
import { ResourceBody } from "./ResourceBody";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: "100%",
            overflow: "hidden"
        },
        gridContainer: {
            height: "100%",
            gridTemplateColumns: "1fr fit-content(200px)"
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        overlay: {
            zIndex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: theme.palette.common.white,
            opacity: 0.5,
        },
        dmUnsupportedOverlay: {
            zIndex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: theme.palette.common.white,
            opacity: 0.5,
        },
        dmUnsupportedMessage: {
            zIndex: 1,
            position: 'absolute'
        }
    }),
);


export interface ServiceDesignProps {
    fnST: STNode;
    langClientPromise: Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    onClose: () => void;
}

export enum ViewOption {
    INITIALIZE,
    EXPAND,
    COLLAPSE,
    NAVIGATE,
    RESET,
}

export interface SelectionState {
    selectedST: DMNode;
    prevST?: DMNode[];
    state?: DMState;
}

export interface ExpressionInfo {
    value: string;
    valuePosition: any;
    label?: string;
}

export interface DMNode {
    stNode: STNode;
    fieldPath: string;
}

enum DMState {
    INITIALIZED,
    NOT_INITIALIZED,
    ST_NOT_FOUND,
}

const selectionReducer = (state: SelectionState, action: { type: ViewOption, payload?: SelectionState, index?: number }) => {
    switch (action.type) {
        case ViewOption.EXPAND:
            const previousST = !!state.prevST.length ? [...state.prevST, state.selectedST] : [state.selectedST];
            return { ...state, selectedST: action.payload.selectedST, prevST: previousST };
        case ViewOption.COLLAPSE:
            const prevSelection = state.prevST.pop();
            return { ...state, selectedST: prevSelection, prevST: [...state.prevST] };
        case ViewOption.NAVIGATE:
            const targetST = state.prevST[action.index];
            return { ...state, selectedST: targetST, prevST: [...state.prevST.slice(0, action.index)] };
        case ViewOption.RESET:
            return { selectedST: { stNode: undefined, fieldPath: undefined }, prevST: [], state: state.selectedST?.stNode ? DMState.ST_NOT_FOUND : DMState.INITIALIZED };
        case ViewOption.INITIALIZE:
            return { selectedST: action.payload.selectedST, prevST: action.payload.prevST, state: DMState.INITIALIZED };
        default:
            return state;
    }
};

export function ServiceDesignC(propsz: ServiceDesignProps) {

    const {
        fnST,
        onClose,
        langClientPromise,
        currentFile
    } = propsz;

    const {
        props
    } = useContext(Context);

    const [isConfigPanelOpen, setConfigPanelOpen] = useState(false);
    const [currentEditableField, setCurrentEditableField] = useState<ExpressionInfo>(null);
    const [isStmtEditorCanceled, setIsStmtEditorCanceled] = useState(false);
    const [fieldTobeEdited, setFieldTobeEdited] = useState('');
    const [showDMOverlay, setShowDMOverlay] = useState(false);

    const [collapsedFields, setCollapsedFields] = React.useState<string[]>([])

    const classes = useStyles();

    const onConfigOpen = () => {
        setConfigPanelOpen(true);
    }

    const enableStatementEditor = (expressionInfo: ExpressionInfo) => {
        setCurrentEditableField(expressionInfo);
    }

    const closeStatementEditor = () => {
        setCurrentEditableField(null);
        setFieldTobeEdited(undefined);
    }

    const cancelStatementEditor = () => {
        setCurrentEditableField(null);
        setIsStmtEditorCanceled(true);
    }

    const handleFieldToBeEdited = (fieldId: string) => {
        setFieldTobeEdited(fieldId);
        if (fieldId === undefined) {
            setIsStmtEditorCanceled(false);
        }
    }

    const handleCollapse = (fieldName: string, expand?: boolean) => {
        if (!expand) {
            setCollapsedFields((prevState) => [...prevState, fieldName]);
        }
        else {
            setCollapsedFields((prevState) => prevState.filter((element) => element !== fieldName));
        }
    }

    const handleOverlay = (showOverlay: boolean) => {
        setShowDMOverlay(showOverlay);
    }

    const fnSTZ = fnST as ServiceDeclaration;

    const children: JSX.Element[] = [];
    fnSTZ?.members.forEach((member) => {
        const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
        children.push(
            <div className={'service-member'} data-start-position={startPosition} >
                <ResourceBody model={member as ResourceAccessorDefinition} />
            </div>
        );
    });

    return (
        <div className={classes.root}>
            <>
                <ServiceHeader onClose={onClose} />
                <div>
                    {fnSTZ && (
                        <>
                            {children}
                        </>
                    )}
                </div>
            </>
        </div>
    )
}
