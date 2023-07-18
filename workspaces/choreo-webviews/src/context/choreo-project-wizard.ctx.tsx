/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React, { useContext, createContext, FC } from "react";

export interface IChoreoProjectWizardContext {
    /** ID of the org for which the project needs to be created */
    orgId: string;
}

const defaultContext: IChoreoProjectWizardContext = {
    orgId: "",
};

const ChoreoProjectWizardContext = createContext(defaultContext);

export const useChoreoProjectWizardContext = () => {
    return useContext(ChoreoProjectWizardContext);
};

export const ChoreoProjWizardContextProvider: FC<{ orgId: string }> = ({ children, orgId }) => {
    return (
        <ChoreoProjectWizardContext.Provider
            value={{
                orgId,
            }}
        >
            {children}
        </ChoreoProjectWizardContext.Provider>
    );
};
