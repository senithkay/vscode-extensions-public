import React, { FC } from "react";
import SwaggerUIReact, { SwaggerUIProps } from "swagger-ui-react";
import "./styles/main.scss";

export const SwaggerUI: FC<SwaggerUIProps> = (props) => {
    return <SwaggerUIReact {...props} />;
};
