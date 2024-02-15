/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectModel, ProjectPortModel } from "../components";
import { CellBounds } from "../components/Cell/CellNode/CellModel";
import { CommonModel, OrgDiagramData, Organization, ProjectGateway } from "../types";
import { AdvancedLinkModel } from "../components/Project/AdvancedLink/AdvancedLinkModel";

export function getDiagramDataFromOrg(org: Organization): OrgDiagramData {
    const projectNodes: Map<string, CommonModel> = generateProjectNodes(org);
    const projectLinks: Map<string, AdvancedLinkModel> = generateProjectLinks(org, projectNodes);

    return {
        nodes: {
            projectNodes,
        },
        links: {
            projectLinks,
        },
    };
}

function generateProjectNodes(org: Organization): Map<string, CommonModel> {
    const nodes: Map<string, CommonModel> = new Map<string, ProjectModel>();
    org.projects?.forEach((project, _key) => {
        const projectNode = new ProjectModel(project);
        nodes.set(projectNode.getID(), projectNode);

        // add project connections
        // project.connections?.forEach((connection) => {
        //     const targetGateway = connection.target as Connection;
        //     if (!targetGateway) {
        //         return;
        //     }
        //     if (!targetGateway.id || !targetGateway.label) {
        //         console.error("Target node not found for connection: ", connection);
        //         return;
        //     }
        //     const targetNode = new ConnectionModel(targetGateway);
        //     nodes.set(targetNode.getID(), targetNode);
        // });
    });

    return nodes;
}

function generateProjectLinks(
    org: Organization,
    projectNodes: Map<string, CommonModel>
): Map<string, AdvancedLinkModel> {
    const links: Map<string, AdvancedLinkModel> = new Map();

    org.projects?.forEach((project, _key) => {
        project.connections?.forEach((connection) => {
            // link projects
            const sourceNode = projectNodes.get(project.id);
            if (connection.target === undefined || (connection.target as ProjectGateway).projectId === undefined) {
                console.error("Target node not found for connection: ", connection);
                return;
            }
            const targetGateway = connection.target as ProjectGateway;
            const targetNode = projectNodes.get(targetGateway.projectId);
            if (!(sourceNode && targetNode)) {
                console.error("Source or target node not found for connection: ", connection);
                return;
            }

            const sourcePort = sourceNode.getPort(
                `${getPortAlignmentForCellBound(connection.source.boundary)}-${sourceNode.getID()}`
            ) as ProjectPortModel;
            const targetPort = targetNode.getPort(
                `${getPortAlignmentForCellBound(targetGateway.boundary)}-${targetNode.getID()}`
            ) as ProjectPortModel;
            if (!(sourcePort && targetPort)) {
                console.error("Source or target port not found for connection: ", connection);
                return;
            }

            const linkId = `${sourceNode.getID()}-${targetNode.getID()}`;
            const link = new AdvancedLinkModel({ testName: linkId });
            link.setSourcePort(sourcePort);
            link.setTargetPort(targetPort);
            sourcePort.addLink(link);
            links.set(linkId, link);
            link.setLocked(true);
        });
    });

    return links;
}

const getPortAlignmentForCellBound = (bound: CellBounds): string => {
    switch (bound) {
        case CellBounds.NorthBound:
            return "top";
        case CellBounds.SouthBound:
            return "bottom";
        case CellBounds.WestBound:
            return "left";
        case CellBounds.EastBound:
            return "right";
        default:
            return "top";
    }
};
