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
    dropdownButton: {
      backgroundColor: "#F4F5F7", 
      height: "40px", 
      minWidth: "200px", 
      color:"#8D91A3",
      "&:hover": {
        backgroundColor: "#E6E7EC", 
        color:"#1D2028"

      }
    },
    dropdownText: {
      fontFamily:"GilmerRegular", 
      padding: "6px", 
      fontSize: "13px", 
      height: "24px"
    },
    lightBulbWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "24px",
      width: "24px",
      backgroundColor: "#FF9D52",
      borderRadius: "50%"
    },
  })
);
