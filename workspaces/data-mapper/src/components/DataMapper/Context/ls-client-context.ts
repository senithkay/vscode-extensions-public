import React from "react";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";

export const LSClientContext = React.createContext<Promise<IBallerinaLangClient>>(undefined);
