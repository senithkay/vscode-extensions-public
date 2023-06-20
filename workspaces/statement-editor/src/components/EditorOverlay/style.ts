/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			fontWeight: 600,
			fontSize: "17px",
			lineHeight: "24px",
			marginTop: "28px",
			marginBottom: "4px",
			color: theme.palette.text.primary
		},
		subtitle: {
			fontWeight: 400,
			fontSize: "13px",
			lineHeight: "20px",
			color: theme.palette.text.hint
		},

	})
);
