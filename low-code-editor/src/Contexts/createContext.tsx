/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useReducer } from "react";

export default function createContext(reducer: any, actions: any = {}, defaultState: any = {}) {
  const Context = React.createContext(defaultState);

  // interface ProviderProps {
  //   children: {},
  //   initialState: {}
  // }

  const Provider = (props: any) => {
    const { children, initialState } = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const boundActions: any = {};
    /* tslint:disable-next-line */
    for (const key in actions) {
      boundActions[key] = actions[key](dispatch);
    }

    return (
      <Context.Provider value={{ state, ...boundActions }}>
        {children}
      </Context.Provider>
    );
  };

  return { Context, Provider };
}
