/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";
import { ComponentPortWidget } from "../../ComponentPort/ComponentPortWidget";
import { ComponentModel } from "../ComponentModel";
import { ComponentHead, IconWrapper } from "../styles";
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

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ComponentModel;
    isSelected: boolean;
    isCollapsed: boolean;
    isFocused: boolean;
    setCollapsedStatus: (status: boolean) => void;
}

export function ComponentHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected, isCollapsed } = props;
    const headPorts = useRef<PortModel[]>([]);
    const [_isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node]);

    const handleOnHover = (task: string) => {
        setIsHovered(task === "SELECT" ? true : false);
        if (!isCollapsed) {
            node.handleHover(headPorts.current, task);
        }
    };

    const getComponentIcon = () => {
        switch (node.component.type) {
            case ComponentType.API_PROXY:
                return <ProxyIcon />;
            // return <i className="fw-proxy"></i>;
            case ComponentType.EVENT_HANDLER:
                return <EventIcon />;
            // return <i className="fw-event-round"></i>;
            case ComponentType.MANUAL_TASK:
                return <ManualTaskIcon />;
            // return <i className="fw-click-round"></i>;
            case ComponentType.SCHEDULED_TASK:
                return <ScheduledTaskIcon />;
            // return <i className="fw-alarm-round"></i>;
            case ComponentType.SERVICE:
                return <ServiceIcon />;
            // return <i className="fw-inventory-round"></i>;
            case ComponentType.TEST:
                return <AddCheckIcon />;
            // return <i className="fw-add-check-round"></i>;
            case ComponentType.WEB_APP:
                return <WebAppIcon />;
            // return <i className="fw-browser-round"></i>;
            case ComponentType.WEB_HOOK:
                return <WebhookIcon />;
            // return <i className="fw-webhook-round"></i>;
            default:
                return <ServiceIcon />;
            // return <i className="fw-kite-round"></i>;
        }
    };

    return (
        <ComponentHead
            isSelected={isSelected}
            onMouseOver={() => handleOnHover("SELECT")}
            onMouseLeave={() => handleOnHover("UNSELECT")}
            isCollapsed={isCollapsed}
        >
            <IconWrapper>{getComponentIcon()}</IconWrapper>
            <ComponentPortWidget port={node.getPort(`left-${node.getID()}`)} engine={engine} />
            <ComponentPortWidget port={node.getPort(`right-${node.getID()}`)} engine={engine} />
        </ComponentHead>
    );
}
