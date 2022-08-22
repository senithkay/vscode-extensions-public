/*
* Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import * as React from 'react';

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { MappingConstructor } from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { TypeWithValue } from "../../../Mappings/TypeWithValue";
import { RecordFieldPortModel, SpecificFieldPortModel } from '../../../Port';

import { TypeWithValueItemWidget } from "./TypeWithValueItemWidget";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
			maxWidth: 400,
			color: "white",
			position: "relative",
			backgroundColor: " #FFFFFF",
			padding: "20px"
		}
	}),
);

export interface DataManipulationWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	typeWithValue?: TypeWithValue;
	value: MappingConstructor;
	engine: DiagramEngine;
	getPort: (portId: string) => SpecificFieldPortModel | RecordFieldPortModel;
	context: IDataMapperContext;
}


export function DataManipulationWidget(props: DataManipulationWidgetProps) {
	const { id, typeWithValue, value, engine, getPort, context } = props;
	const classes = useStyles();

	return (
		<div className={classes.root}>
			{
				typeWithValue.childrenTypes.map((item) => {
					return (
						<TypeWithValueItemWidget
							key={id}
							engine={engine}
							field={item}
							getPort={getPort}
							parentId={id}
							mappingConstruct={value}
							context={context}
						/>
					);
				})
			}
		</div>
	);
}
