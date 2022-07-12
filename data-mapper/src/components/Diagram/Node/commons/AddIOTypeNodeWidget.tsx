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

import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { AddOutputTypeNode } from "../AddOutputType";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		contentWrapper: {
			minHeight: '600px',
			minWidth: '344px',
			borderRadius: '8px',
			backgroundColor: '#FFFFFF',
			boxShadow: '0 2px 40px 0 rgba(102,103,133,0.15)',
			padding: '20px'
		},
		title: {
			display: "flex",
			paddingBottom: '20px'
		},
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
	title: string;
}

export function AddIOTypeNodeWidget(props: AddOutputTypeNodeWidgetProps) {
	const { node, engine, title } = props;
	const classes = useStyles();

	return (
		<div className={classes.contentWrapper}>
			<Typography className={classes.title}>{title}</Typography>
			<Button className={classes.addTypeButton}>
				Add {title.toLowerCase()} type
			</Button>
		</div>
	);
}
