/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// import { MouseEvent, TouchEvent } from 'react';
import {
	SelectingState,
	State,
	Action,
	InputType,
	ActionEvent,
	DragCanvasState
} from '@projectstorm/react-canvas-core';
import { DragNewLinkState } from './DragNewLinkState';
import { DiagramEngine, DragDiagramItemsState, PortModel } from '@projectstorm/react-diagrams-core';

export class DefaultState extends State<DiagramEngine> {
	dragCanvas: DragCanvasState;
	dragNewLink: DragNewLinkState;
	dragItems: DragDiagramItemsState;

	constructor() {
		super({
			name: 'default-diagrams'
		});
		this.childStates = [new SelectingState()];
		this.dragCanvas = new DragCanvasState();
		this.dragNewLink = new DragNewLinkState();
		this.dragItems = new DragDiagramItemsState();

		// determine what was clicked on
		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event: ActionEvent<any>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(event);

					// the canvas was clicked on, transition to the dragging canvas state
					if (!element) {
						this.transitionWithEvent(this.dragCanvas, event);
					}
					// initiate dragging a new link
					else if (element instanceof PortModel) {
						this.transitionWithEvent(this.dragNewLink, event);
					}
					// move the items (and potentially link points)
					else {
						this.transitionWithEvent(this.dragItems, event);
					}
				}
			})
		);

		// touch drags the canvas
		this.registerAction(
			new Action({
				type: InputType.TOUCH_START,
				fire: (event: ActionEvent<any>) => {
					this.transitionWithEvent(this.dragCanvas, event);
				}
			})
		);
	}
}
