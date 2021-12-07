/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import React from "react";
import { Chip } from "@material-ui/core";

interface OutlinedLabelProps {
  type: "success" | "warning" | "info" | "primary" | "default";
  label: string;
  isLink?: boolean;
  shape?: "square" | "round";
}

const OutlinedLabel = ({ type, label, isLink, shape }: OutlinedLabelProps) => {
  let primaryColor = "#5567D5";
  const cursorStyle = isLink ? "pointer" : "default";
  switch (type) {
    case "primary":
      primaryColor = "#5567D5";
      break;
    case "success":
      primaryColor = "#36B475";
      break;
    case "warning":
      primaryColor = "#ff9d52";
      break;
    case "info":
      primaryColor = "#0095FF";
      break;
    case "default":
      primaryColor = "#636363";
      break;
    default:
      primaryColor = "#5567D5";
  }

  return (
    <Chip
      size="small"
      label={label}
      variant="outlined"
      style={{
        color: primaryColor,
        borderColor: primaryColor,
        padding: 6,
        paddingTop: 2,
        paddingBottom: 2,
        height: "auto",
        cursor: cursorStyle,
        fontSize: 11,
        borderRadius: shape === "square" ? 3 : 10,
      }}
    />
  );
};
export default OutlinedLabel;

OutlinedLabel.defaultProps = {
  isLink: false,
  shape: "round",
};
