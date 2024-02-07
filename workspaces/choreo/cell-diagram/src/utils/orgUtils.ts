/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { ComponentLinkModel, ProjectLinkModel, ProjectModel, ProjectPortModel } from "../components";
import { CellBounds } from "../components/Cell/CellNode/CellModel";
import { CommonModel, OrgDiagramData, Organization } from "../types";
import { PathFindingLinkFactory, PathFindingLinkModel } from "@projectstorm/react-diagrams-routing";
import { AdvancedLinkModel } from "../components/Project/AdvancedLink/AdvancedLinkModel";

export function getDiagramDataFromOrg(org: Organization, engine: DiagramEngine): OrgDiagramData {
    const projectNodes: Map<string, CommonModel> = generateProjectNodes(org);
    const projectLinks: Map<string, PathFindingLinkModel> = generateProjectLinks(org, projectNodes, engine);

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
    });

    return nodes;
}

function generateProjectLinks(
    org: Organization,
    projectNodes: Map<string, CommonModel>,
    engine: DiagramEngine
): Map<string, PathFindingLinkModel> {
    const links: Map<string, PathFindingLinkModel> = new Map();
    const pathFindingFactory = engine
        .getLinkFactories()
        .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME);

    org.projects?.forEach((project, _key) => {
        project.connections?.forEach((connection) => {
            const sourceNode = projectNodes.get(project.id);
            const targetNode = projectNodes.get(connection.target.projectId);
            if (!(sourceNode && targetNode)) {
                console.error("Source or target node not found for connection: ", connection);
                return;
            }

            const sourcePort = sourceNode.getPort(
                `${getPortAlignmentForCellBound(connection.source.boundary)}-${sourceNode.getID()}`
            ) as ProjectPortModel;
            const targetPort = targetNode.getPort(
                `${getPortAlignmentForCellBound(connection.target.boundary)}-${targetNode.getID()}`
            ) as ProjectPortModel;
            if (!(sourcePort && targetPort)) {
                console.error("Source or target port not found for connection: ", connection);
                return;
            }

            const linkId = `${sourceNode.getID()}-${targetNode.getID()}`;
            const link = new AdvancedLinkModel({testName: linkId});
            
            // const link = new ProjectLinkModel(linkId);
            // const link = sourcePort.link(targetPort, pathFindingFactory);
            link.setSourcePort(sourcePort);
            link.setTargetPort(targetPort);
            sourcePort.addLink(link);
            // link.setSourceNode(sourceNode.getID());
            // link.setTargetNode(targetNode.getID());
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
