import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import React from "react";

export const LSClientContext = React.createContext<Promise<IBallerinaLangClient>>(undefined);