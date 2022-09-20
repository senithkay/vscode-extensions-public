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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    element: {
			backgroundColor: theme.palette.common.white,
			padding: '10px',
			cursor: 'pointer',
			transitionDuration: '0.2s',
			userSelect: 'none',
			pointerEvents: 'auto',
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			'&:hover': {
				filter: 'brightness(0.95)'
			}
		},
    lightBulbWrapper: {
      height: "22px",
			width: "22px",
			backgroundColor: theme.palette.warning.light,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			borderRadius: "50%",
    },
  })
);
