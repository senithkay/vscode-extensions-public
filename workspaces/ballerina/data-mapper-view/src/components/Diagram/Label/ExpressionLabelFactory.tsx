import * as React from 'react';

import { AbstractReactFactory, GenerateWidgetEvent } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { container, injectable, singleton } from 'tsyringe';

import { ExpressionLabelModel } from './ExpressionLabelModel';
import { EditableLabelWidget } from './ExpressionLabelWidget';
import { MappingType } from '../Port';
import { ArrayMappingOptionsWidget } from './ArrayMappingOptionsWidget';
import { SubLinkLabelWidget } from './SubLinkLabelWidget';

@injectable()
@singleton()
export class ExpressionLabelFactory extends AbstractReactFactory<ExpressionLabelModel, DiagramEngine> {
	constructor() {
		super('expression-label');
	}

	generateModel(): ExpressionLabelModel {
		return new ExpressionLabelModel();
	}

	generateReactWidget(event: GenerateWidgetEvent<ExpressionLabelModel>): JSX.Element {
		const { pendingMappingType, isSubLinkLabel } = event.model;

		if (pendingMappingType == MappingType.ArrayToArray) {
			return <ArrayMappingOptionsWidget model={event.model}/>;
		}

		if (isSubLinkLabel) {
			return <SubLinkLabelWidget model={event.model}  />;
		}

		return <EditableLabelWidget model={event.model} />;
	}
}
container.register("LabelFactory", {useClass: ExpressionLabelFactory});
