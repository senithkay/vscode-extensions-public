import { DiagramModel, PointModel } from '@projectstorm/react-diagrams-core';
import * as dagre from 'dagre';
import * as _ from 'lodash';
import { GraphLabel } from 'dagre';
import { Point } from '@projectstorm/geometry';
import { COMPONENT_NODE, EMPTY_NODE, MAIN_CELL } from '../constants';

export interface DagreEngineOptions {
    graph?: GraphLabel;
    /**
     * Will also layout links
     */
    includeLinks?: boolean;
}

export class DagreEngine {
    options: DagreEngineOptions;

    constructor(options: DagreEngineOptions = {}) {
        this.options = options;
    }

    redistribute(model: DiagramModel) {
        // Create a new directed graph
        const g = new dagre.graphlib.Graph({
            multigraph: true,
            compound: true
        });
        g.setGraph(this.options.graph || {});
        g.setDefaultEdgeLabel(function () {
            return {};
        });

        // set nodes
        _.forEach(model.getNodes(), (node) => {
            // Check if the node is of type EMPTY_NODE
            if (node.getType() === EMPTY_NODE) {
                // If it's an EMPTY_NODE, set its position as fixed
                g.setNode(node.getID(), { label: node.getID(), width: node.width, height: node.height, x: node.getX(), y: node.getY(), fixed: true });
            } else {
                // For other nodes, set the default position
                g.setNode(node.getID(), { label: node.getID(), width: node.width, height: node.height });
            }
        });

        // set node parents
        const mainCell = g.node(MAIN_CELL);
        if (mainCell) {
            _.forEach(model.getNodes(), (node) => {
                if (node.getType() === COMPONENT_NODE) {
                    g.setParent(node.getID(), MAIN_CELL);

                }
            });
        }

        _.forEach(model.getLinks(), (link) => {
            // set edges
            if (link.getSourcePort() && link.getTargetPort()) {
                g.setEdge({
                    v: link.getSourcePort().getNode().getID(),
                    w: link.getTargetPort().getNode().getID(),
                    name: link.getID()
                });
            }
        });

        // layout the graph
        dagre.layout(g);

        g.nodes().forEach((v) => {
            const node = g.node(v);
            // Only update positions for non-EMPTY_NODE type nodes
            if (model.getNode(v).getType() !== EMPTY_NODE) {
                model.getNode(v).setPosition(node.x - node.width / 2, node.y - node.height / 2);
            }
        });

        // also include links?
        if (this.options.includeLinks) {
            g.edges().forEach((e) => {
                const edge = g.edge(e);
                const link = model.getLink(e.name);

                const points = [link.getFirstPoint()];
                for (let i = 1; i < edge.points.length - 1; i++) {
                    points.push(new PointModel({ link: link, position: new Point(edge.points[i].x, edge.points[i].y) }));
                }
                link.setPoints(points.concat(link.getLastPoint()));
            });
        }
    }
}
