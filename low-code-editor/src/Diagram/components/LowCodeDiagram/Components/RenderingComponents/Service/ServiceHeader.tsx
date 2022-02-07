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
import React, { useContext } from "react";

import {
    ListenerDeclaration,
    ServiceDeclaration,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import { ServiceIconLight } from "../../../../../../assets/icons/ServiceIcon";
import { Context as DiagramContext } from "../../../Context/diagram";
import { HeaderActions } from "../../../HeaderActions";
import { HeaderWrapper } from "../../../HeaderWrapper";

import "./style.scss";

export const SERVICE_HEADER_HEIGHT: number = 49;

export const SERVICE_TYPE_WIDTH: number = 80;
export const SERVICE_TYPE_HEIGHT: number = 32;
export const SERVICE_TYPE_PADDING_TOP: number = 8.5;
export const SERVICE_TYPE_PADDING_LEFT: number = 8.5;

export const SERVICE_TYPE_TEXT_PADDING_TOP: number = 20;
export const SERVICE_TYPE_TEXT_PADDING_LEFT: number = 15;

export const SERVICE_PATH_TEXT_PADDING_TOP: number = 20;
export const SERVICE_PATH_TEXT_PADDING_LEFT: number = 15;

export const SERVICE_LISTENER_AND_PATH_GAP: number = 100;

export interface ServiceHeaderProps {
    model: ServiceDeclaration;
    isExpanded: boolean;
    onExpandClick: () => void;
}

export function ServiceHeader(props: ServiceHeaderProps) {
    const { model, isExpanded, onExpandClick } = props;
    const diagramContext = useContext(DiagramContext);
    const { stSymbolInfo } = diagramContext.props;
    const deleteComponent = diagramContext?.api?.edit?.deleteComponent;
    let servicePath = "";

    model.absoluteResourcePath.forEach((pathSegment) => {
        servicePath += pathSegment.value;
    });

    let serviceType = "";
    let listeningOnText = "";
    let isUnsupportedType;

    if (STKindChecker.isExplicitNewExpression(model.expressions[0])) {
        if (
            STKindChecker.isQualifiedNameReference(
                model.expressions[0].typeDescriptor
            )
        ) {
            serviceType = model.expressions[0].typeDescriptor.modulePrefix.value.toUpperCase();
            listeningOnText = model.expressions[0].source;
        }
    } else if (STKindChecker.isSimpleNameReference(model.expressions[0])) {
        const listenerNode: ListenerDeclaration = stSymbolInfo.listeners.get(
            model.expressions[0].name.value
        ) as ListenerDeclaration;
        if (STKindChecker.isQualifiedNameReference(listenerNode.typeDescriptor)) {
            serviceType = listenerNode.typeDescriptor.modulePrefix.value.toUpperCase();
            listeningOnText = model.expressions[0].source;
        }
    }

    const unSupportedTypes = ["GRAPHQL", "GRPC", "NATS", "WEBSOCKET", "WEBSUB"];
    (unSupportedTypes.includes(serviceType)) ? isUnsupportedType = true : isUnsupportedType = false;

    const handleDeleteConfirm = () => {
        deleteComponent(model);
    };

    return (
        <HeaderWrapper
            className={"service-header"}
            onClick={onExpandClick}
        >
            <div className={"header-segement-container"}>
                <div className={"header-segment"}>
                    <ServiceIconLight className="dark-fill"/>
                </div>
                <div className={"header-segment"}>{serviceType}</div>
                <div className={"header-segment-path"}>{servicePath}</div>
                <div className={"header-segment-listener"}>
                    {listeningOnText.length > 0 ? `listening on ${listeningOnText}` : ""}
                </div>
            </div>
            <HeaderActions
                model={model}
                deleteText="Delete this Service?"
                isExpanded={isExpanded}
                onExpandClick={onExpandClick}
                onConfirmDelete={handleDeleteConfirm}
                unsupportedType={isUnsupportedType}
            />
        </HeaderWrapper >
    );
}
