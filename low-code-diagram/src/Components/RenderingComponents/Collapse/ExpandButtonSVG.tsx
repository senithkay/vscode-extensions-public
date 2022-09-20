/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

import './style.scss';

interface ExpandButtonSVGProps {
    x: number;
    y: number;
    onCollapseClick?: () => void;
}

export function ExpandButtonSVG(props: ExpandButtonSVGProps) {
    const { onCollapseClick: onExpandClick, ...xyProps } = props;
    return (
        <svg {...xyProps} width="18px" height="18px" viewBox="0 0 18.0 18.0" >
            <defs>
                <clipPath id="i0">
                    <path d="M2130,0 L2130,1221 L0,1221 L0,0 L2130,0 Z" />
                </clipPath>
                <clipPath id="i1">
                    <path d="M14,0 C15.1045695,-2.02906125e-16 16,0.8954305 16,2 L16,14 C16,15.1045695 15.1045695,16 14,16 L2,16 C0.8954305,16 1.3527075e-16,15.1045695 0,14 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 L14,0 Z" />
                </clipPath>
                <clipPath id="i2">
                    <path d="M3.5,6.37948767 L5.85358222,8.72993246 C6.04882844,8.92491841 6.04880263,9.24102733 5.85352456,9.43598149 C5.67994406,9.60927408 5.41051809,9.62850845 5.21566095,9.49369847 L5.14641778,9.43592393 L3.5,7.79186237 L1.85358222,9.43592393 C1.68003002,9.60924478 1.41060719,9.62852301 1.21572804,9.49374476 L1.14647544,9.43598149 C0.972894934,9.26268891 0.953587817,8.9936691 1.08856798,8.79908147 L1.14641778,8.72993246 L3.5,6.37948767 Z M6.5,4.29012121 C6.77614237,4.29012121 7,4.51397884 7,4.79012121 C7,5.0355811 6.82312484,5.23972959 6.58987563,5.28206555 L6.5,5.29012121 L0.5,5.29012121 C0.223857625,5.29012121 0,5.06626359 0,4.79012121 C0,4.54466133 0.176875161,4.34051284 0.410124368,4.29817688 L0.5,4.29012121 L6.5,4.29012121 Z M1.78433905,0.088481784 L1.85358222,0.146256327 L3.5,1.79031789 L5.14641778,0.146256327 C5.31996998,-0.02706452 5.58939281,-0.0463427559 5.78427196,0.0884354931 L5.85352456,0.146198761 C6.02710507,0.319491348 6.04641218,0.588511152 5.91143202,0.783098783 L5.85358222,0.852247794 L3.5,3.20269258 L1.14641778,0.852247794 C0.951171559,0.657261841 0.951197371,0.341152922 1.14647544,0.146198761 C1.32005594,-0.0270938257 1.58948191,-0.0463281936 1.78433905,0.088481784 Z" />
                </clipPath>
            </defs>
            <g transform="translate(-1592.0 -459.0)">
                <g clip-path="url(#i0)">
                    <g transform="translate(1593.0 460.0)">
                        <path d="M14,-1 C14.8284271,-1 15.5784271,-0.664213562 16.1213203,-0.121320344 C16.6642136,0.421572875 17,1.17157288 17,2 L17,14 C17,14.8284271 16.6642136,15.5784271 16.1213203,16.1213203 C15.5784271,16.6642136 14.8284271,17 14,17 L2,17 C1.17157288,17 0.421572875,16.6642136 -0.121320344,16.1213203 C-0.664213562,15.5784271 -1,14.8284271 -1,14 L-1,2 C-1,1.17157288 -0.664213562,0.421572875 -0.121320344,-0.121320344 C0.421572875,-0.664213562 1.17157288,-1 2,-1 Z" stroke="none" fill="rgba(161, 161, 161, 0.325807)" />
                        <path d="M2,0 L14,0 C15.1045695,-2.02906125e-16 16,0.8954305 16,2 L16,14 C16,15.1045695 15.1045695,16 14,16 L2,16 C0.8954305,16 1.3527075e-16,15.1045695 0,14 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" stroke="#BCBEC4" stroke-width="2" fill="none" stroke-miterlimit="5" />
                        <g clip-path="url(#i1)">
                            <polygon points="0,0 16,0 16,16 0,16 0,0" stroke="none" fill="#FFFFFF" />
                        </g>
                        <g transform="translate(4.5 3.21000000000015)">
                            <g clip-path="url(#i2)">
                                <polygon points="0,7.77156117e-14 7,7.77156117e-14 7,9.58218026 0,9.58218026 0,7.77156117e-14" stroke="none" fill="#3F3F4A" />
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}
