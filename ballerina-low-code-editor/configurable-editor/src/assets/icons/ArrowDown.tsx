/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from 'react';
import { useStyles } from './style';

export default function ArrowDown() {
  const classes = useStyles();

  return (
    <svg viewBox="0 0 16 16" className={classes.defaultMainIcon}>
      <path
        d="M3.15035 5.65054C3.32392 5.47697 3.59334 5.45768 3.78821 5.59268L3.85746 5.65054L7.99982 
        9.793L12.1422 5.65054C12.3157 5.47697 12.5852 5.45768 12.78 5.59268L12.8493 5.65054C13.0228 
        5.8241 13.0421 6.09353 12.9071 6.28839L12.8493 6.35764L7.99982 11.2071L3.15035 6.35764C2.95509 
        6.16238 2.95509 5.8458 3.15035 5.65054Z"
        fill="currentColor"
      />
    </svg>
  );
}
