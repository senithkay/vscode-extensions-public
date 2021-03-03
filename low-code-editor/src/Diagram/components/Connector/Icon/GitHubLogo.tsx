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
import * as React from "react";

export const GITHUB_LOGO_WIDTH = 48;
export const GITHUB_LOGO_HEIGHT = 48;

export function GitHubLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (GITHUB_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (GITHUB_LOGO_HEIGHT / 2)} width={GITHUB_LOGO_WIDTH} height={GITHUB_LOGO_HEIGHT} >
            <g id="GithubWrapper">
                <path id="Fill_4" d="M24,0C10.747,0,0,11.017,0,24.608A24.563,24.563,0,0,0,16.413,47.956c1.2.227,1.638-.533,1.638-1.186,0-.583-.021-2.132-.032-4.184-6.676,1.486-8.084-3.3-8.084-3.3-1.092-2.843-2.665-3.6-2.665-3.6-2.179-1.526.165-1.5.165-1.5a5.054,5.054,0,0,1,3.676,2.536c2.141,3.76,5.618,2.674,6.985,2.044a5.31,5.31,0,0,1,1.523-3.289C14.29,34.862,8.687,32.75,8.687,23.321a9.645,9.645,0,0,1,2.471-6.6,9.049,9.049,0,0,1,.236-6.512s2.014-.662,6.6,2.523a22.179,22.179,0,0,1,12.017,0c4.582-3.184,6.593-2.523,6.593-2.523a9.051,9.051,0,0,1,.24,6.512,9.628,9.628,0,0,1,2.466,6.6c0,9.454-5.612,11.534-10.957,12.142a5.958,5.958,0,0,1,1.628,4.558c0,3.289-.029,5.943-.029,6.749,0,.659.433,1.425,1.65,1.184A24.569,24.569,0,0,0,48,24.608C48,11.017,37.253,0,24,0" fill="#161514" />
            </g>
        </svg>
    )
}

