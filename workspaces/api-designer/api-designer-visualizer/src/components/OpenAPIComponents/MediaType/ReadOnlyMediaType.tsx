/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { MediaType as M } from '../../../Definitions/ServiceDefinitions';
import { ReadOnlySchemaEditor } from '../../SchemaEditor/ReadOnlySchemaEditor';

interface MediaTypeProps {
    mediaType: M;
}

export function ReadOnlyMediaType(props: MediaTypeProps) {
    const { mediaType } = props;

    return (
        <>
            {mediaType?.schema && 
                <ReadOnlySchemaEditor
                    schema={mediaType?.schema}
                    schemaName={mediaType?.schema?.type as string}
                    variant='h3'
                />
            }
        </>
    )
}
