import React, { FC } from "react";
import SwaggerUIReact, { SwaggerUIProps } from "swagger-ui-react";
import '@wso2-enterprise/ui-toolkit/src/styles/swagger/main.scss';

export const SwaggerUI: FC<SwaggerUIProps> = (props) => {
    return <SwaggerUIReact {...props} />;
};
