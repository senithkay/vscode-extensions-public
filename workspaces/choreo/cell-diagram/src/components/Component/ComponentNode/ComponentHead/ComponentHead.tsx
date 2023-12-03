/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { ComponentPortWidget } from "../../ComponentPort/ComponentPortWidget";
import { ComponentModel } from "../ComponentModel";
import { ComponentHead, ComponentKind, IconWrapper } from "../styles";
import { ComponentType } from "../../../../types";
import {
    WebAppIcon,
    ScheduledTaskIcon,
    ServiceIcon,
    ProxyIcon,
    EventIcon,
    AddCheckIcon,
    ManualTaskIcon,
    WebhookIcon,
} from "../../../../resources/assets/icons";
import * as icons from "../../../../resources/assets/icons"; // import all icon SVGs as an object
import { MenuItemDef, MoreVertMenu } from "../../../MoreVertMenu/MoreVertMenu";
import { DiagramContext } from "../../../DiagramContext/DiagramContext";
import { COMPONENT_LINE_MIN_WIDTH } from "../../../../resources";

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ComponentModel;
    isSelected: boolean;
    isFocused: boolean;
    menuItems: MenuItemDef[];
}

export function ComponentHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected, isFocused, menuItems } = props;

    const { zoomLevel } = useContext(DiagramContext);

    const getComponentTypeIcon = (type: ComponentType) => {
        switch (type) {
            case ComponentType.API_PROXY:
                return <ProxyIcon />;
            case ComponentType.EVENT_HANDLER:
                return <EventIcon />;
            case ComponentType.MANUAL_TASK:
                return <ManualTaskIcon />;
            case ComponentType.SCHEDULED_TASK:
                return <ScheduledTaskIcon />;
            case ComponentType.SERVICE:
                return <ServiceIcon />;
            case ComponentType.TEST:
                return <AddCheckIcon />;
            case ComponentType.WEB_APP:
                return <WebAppIcon />;
            case ComponentType.WEB_HOOK:
                return <WebhookIcon />;
            default:
                return <ServiceIcon />;
        }
    };

    const getComponentBuildIcon = (kind: string) => {
        const icon = kind + "Icon";
        const IconComponent = icons[icon] || icons.codeIcon;
        return <IconComponent />;
    };

    return (
        <ComponentHead isSelected={isSelected || isFocused} borderWidth={node.getDynamicLineWidth(zoomLevel, COMPONENT_LINE_MIN_WIDTH)}>
            <IconWrapper>{getComponentTypeIcon(node.component.type)}</IconWrapper>
            <ComponentPortWidget port={node.getPort(`left-${node.getID()}`)} engine={engine} />
            <ComponentPortWidget port={node.getPort(`right-${node.getID()}`)} engine={engine} />
            {node.component.buildPack && node.component.buildPack.toLowerCase() !== "other" && (
                <ComponentKind>{getComponentBuildIcon(node.component.buildPack)}</ComponentKind>
            )}
            {isFocused && menuItems?.length > 0 && (
                <MoreVertMenu
                    component={node.component}
                    menuItems={menuItems}
                    hasComponentKind={node.component.buildPack && node.component.buildPack.toLowerCase() !== "other"}
                />
            )}
        </ComponentHead>
    );
}
