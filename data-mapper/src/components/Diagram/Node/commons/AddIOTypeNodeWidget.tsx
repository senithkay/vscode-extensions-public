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

import { Button } from '@material-ui/core';
import {createStyles, makeStyles, Theme, withStyles, WithStyles} from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { AddOutputTypeNode } from "../AddOutputType/AddOutputTypeNode";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		addTypeButton: {
			verticalAlign: "middle",
			padding: "5px",
			color: "#222228",
			fontFamily: "GilmerMedium, Gilmer Medium",
			fontSize: "13px",
			minWidth: "100px",
			backgroundColor: "#FFFFFF",
			border: "1px solid #CBCEDB",
			display: "flex",
			textTransform: "none"
		}
	})
);

export interface AddOutputTypeNodeWidgetProps {
	node: AddOutputTypeNode;
	engine: DiagramEngine;
}

export function AddIOTypeNodeWidget(props: AddOutputTypeNodeWidgetProps) {
	const { node, engine } = props;
	const classes = useStyles();

	return (
		<div>
			<Button className={classes.addTypeButton}>
				Add output type
			</Button>
		</div>
	);
}
