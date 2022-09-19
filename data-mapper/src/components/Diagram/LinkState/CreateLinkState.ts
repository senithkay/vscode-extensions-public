import { Action, ActionEvent, InputType, State } from '@projectstorm/react-canvas-core';
import { PortModel, LinkModel, DiagramEngine } from '@projectstorm/react-diagrams-core';
import { MouseEvent, KeyboardEvent } from 'react';
import { RecordFieldPortModel } from '../Port/model/RecordFieldPortModel';

/**
 * This state is controlling the creation of a link.
 */
export class CreateLinkState extends State<DiagramEngine> {
	sourcePort: PortModel;
	link: LinkModel;

	constructor() {
		super({ name: 'create-new-link' });

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (actionEvent: ActionEvent<MouseEvent>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(actionEvent);

					if (element instanceof PortModel && !this.sourcePort) {
						if (element instanceof RecordFieldPortModel) {
							if (element.portType === "OUT") {
								this.sourcePort = element;
								element.fireEvent({}, "mappingStartedFrom");
								const link = this.sourcePort.createLinkModel();
								link.setSourcePort(this.sourcePort);
								link.getFirstPoint().setPosition(0, 0);
								link.getLastPoint().setPosition(0, 0);
								this.link = this.engine.getModel().addLink(link);

							} else {
								// TODO: show a message: select input port first
							}
						}
					} else if (element instanceof PortModel && this.sourcePort && element !== this.sourcePort) {
						if (element instanceof RecordFieldPortModel) {
							if (element.portType === "IN") {
								element.fireEvent({}, "mappingFinishedTo");
								if (this.sourcePort.canLinkToPort(element)) {

									this.link.setTargetPort(element);
									// element.reportPosition();
									this.link.getLastPoint().setPosition(0, 0);
									this.clearState();
									this.eject();
								}
							} else {
								// Selected another input port, change selected port
								this.sourcePort.fireEvent({}, "link-unselected");
								this.sourcePort.removeLink(this.link);
								this.sourcePort = element;
								this.link.setSourcePort(element);
								this.link.getFirstPoint().setPosition(0, 0);
								this.link.getLastPoint().setPosition(0, 0);
								element.fireEvent({}, "mappingStartedFrom");
							}
						}
					} else if (element === this.link.getLastPoint()) {
						this.link.point(0, 0, -1);
					}

					this.engine.repaintCanvas();
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_MOVE,
				fire: (actionEvent: ActionEvent<React.MouseEvent>) => {
					if (!this.link) return;
					const { event } = actionEvent;
					this.link.getLastPoint().setPosition(0, 0);
					this.engine.repaintCanvas();
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.KEY_UP,
				fire: (actionEvent: ActionEvent<KeyboardEvent>) => {
					// on esc press remove any started link and pop back to default state
					if (actionEvent.event.keyCode === 27) {
						this.link.remove();
						this.clearState();
						this.eject();
						this.engine.repaintCanvas();
					}
				}
			})
		);
	}

	clearState() {
		this.link = undefined;
		this.sourcePort = undefined;
	}
}
