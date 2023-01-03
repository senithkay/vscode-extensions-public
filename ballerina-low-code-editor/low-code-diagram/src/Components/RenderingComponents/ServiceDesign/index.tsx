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
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import {
    NodePosition,
    ResourceAccessorDefinition,
    ServiceDeclaration,
} from "@wso2-enterprise/syntax-tree";


import { ResourceBody } from "./Resource";
import "./style.scss";

export interface ServiceDesignProps {
    model: ServiceDeclaration;
}

export function ServiceDesign(props: ServiceDesignProps) {

    const {
        model,
    } = props;

    const [isAllExpanded, setIsAllExpanded] = useState(false);


    const intl = useIntl();

    // useEffect(() => {
    //     console.log('service model >>>', model)
    //     const cc: JSX.Element[] = [];
    //     model.members.forEach((member) => {
    //         const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
    //         cc.push(
    //             <div className={'service-member'} data-start-position={startPosition} >
    //                 <ResourceBody model={member as ResourceAccessorDefinition} />
    //             </div>
    //         );
    //     });
    //     setChildren(cc);
    // }, [model, isAllExpanded]);


    const memberComponents: JSX.Element[] = [];
    model.members.forEach((member) => {
        const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
        memberComponents.push(
            <div className={'service-member'} data-start-position={startPosition} >
                <ResourceBody model={member as ResourceAccessorDefinition} />
            </div>
        );
    });

    const onExpandAllClick = () => {
        const ex = !isAllExpanded;
        setIsAllExpanded(ex);
    }

    const handlePlusClick = () => {
        const lastMemberPosition: NodePosition = {
            endColumn: model.closeBraceToken.position.endColumn,
            endLine: model.closeBraceToken.position.endLine,
            startColumn: model.closeBraceToken.position.startColumn,
            startLine: model.closeBraceToken.position.startLine
        }
        // handleDiagramEdit(undefined, lastMemberPosition, { formType: "ResourceAccessorDefinition", isLoading: false });
    };

    return (
        <div >
            {model && (
                <>
                    {/* <ServiceHeader model={model} /> */}
                    <div >
                        <div onClick={onExpandAllClick}>
                            Collapse All
                            {/* <ComponentExpandButton
                                isExpanded={isAllExpanded}
                                onClick={onExpandAllClick}
                            /> */}
                        </div>
                    </div>
                    <div >
                        <>
                            {memberComponents}
                        </>
                    </div>

                    <div >
                        {/* <LinePrimaryButton
                            text={"Add Resource"}
                            onClick={handlePlusClick}
                            dataTestId="add-new-btn"
                        /> */}
                    </div>
                </>
            )}

        </div>
    )
}
