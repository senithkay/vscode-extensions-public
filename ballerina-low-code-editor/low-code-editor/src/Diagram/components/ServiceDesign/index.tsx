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
import { useIntl } from "react-intl";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { ConfigOverlayFormStatus, getSource, TopLevelPlusIcon, updateResourceSignature } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { ResourceBody } from "./Resource";
import { ServiceHeader } from "./ServiceHeader";
import { useStyles } from "./style";
import "./style.scss";

export interface ServiceDesignProps {
    fnST: STNode;
    langClientPromise: Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    onClose: () => void;
    handleDiagramEdit: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
}

export function ServiceDesign(propsz: ServiceDesignProps) {

    const {
        fnST,
        onClose,
        langClientPromise,
        currentFile,
        handleDiagramEdit
    } = propsz;

    const [isPlusClicked, setPlusClicked] = useState(false);

    const classes = useStyles();
    const intl = useIntl();


    const fnSTZ = fnST as ServiceDeclaration;

    const children: JSX.Element[] = [];
    fnSTZ?.members.forEach((member) => {
        const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
        children.push(
            <div className={'service-member'} data-start-position={startPosition} >
                <ResourceBody handleDiagramEdit={handleDiagramEdit} model={member as ResourceAccessorDefinition} />
            </div>
        );
    });


    const handlePlusClick = () => {
        const lastMemberPosition: NodePosition = {
            endColumn: fnSTZ.closeBraceToken.position.endColumn,
            endLine: fnSTZ.closeBraceToken.position.endLine - 1,
            startColumn: fnSTZ.closeBraceToken.position.startColumn,
            startLine: fnSTZ.closeBraceToken.position.startLine - 1
        }
        handleDiagramEdit(undefined, lastMemberPosition, { formType: "ResourceAccessorDefinition", isLoading: false });
    };

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
                <div className="plus-btn-wrapper" onClick={handlePlusClick}>
                    <TopLevelPlusIcon selected={isPlusClicked} />
                </div>
            </>
        </div>
    )
}
