/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Action, InputType } from "@projectstorm/react-canvas-core";
import _ from "lodash";
import { DefaultLinkModel } from "../components/default/link/DefaultLinkModel";
import { DefaultNodeModel } from "../components/default/node/DefaultNodeModel";
import { TransformNodeProperties, Node } from "@wso2-enterprise/eggplant-core";

export interface DeleteItemsActionOptions {
	keyCodes?: number[];
	modifiers?: {
		ctrlKey?: boolean;
		shiftKey?: boolean;
		altKey?: boolean;
		metaKey?: boolean;
	};
}

/**
 * Deletes all selected items
 */
export class CustomDeleteItemsAction extends Action {
	constructor(options: DeleteItemsActionOptions = {}) {
		const keyCodes = options.keyCodes || [46, 8];
		const modifiers = {
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			...options.modifiers
		};

		super({
			type: InputType.KEY_DOWN,
			fire: (event: any) => {
				const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = event.event;

				if (keyCodes.indexOf(keyCode) !== -1 && _.isEqual({ ctrlKey, shiftKey, altKey, metaKey }, modifiers)) {
					_.forEach(this.engine.getModel().getSelectedEntities(), (model: any) => {
						if (model instanceof DefaultLinkModel) {
							const targetNode = model.getTargetPort().getParent() as DefaultNodeModel;
							if (targetNode.getKind() === "TransformNode") {
								const properties = targetNode.getOptions().node.properties as TransformNodeProperties;
								properties.resetFuncBody = true;
								targetNode.getOptions().node.properties = properties;
							}
						}
						// only delete items which are not locked
						if (!model.isLocked()) {
							model.remove();
						}
					});
					this.engine.repaintCanvas
				}
			}
		});
	}
}
