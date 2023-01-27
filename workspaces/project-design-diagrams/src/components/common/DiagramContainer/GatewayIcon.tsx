import React from "react";

export function GatewayIcon() {
    return (
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
             x="0px" y="0px" viewBox="0 0 160 160"
             xmlSpace="preserve">
            <symbol id="Arrow_26" viewBox="-22.86 -13.14 45.72 26.28">
                <rect x="-22.86" y="-13.14" style={{fill: "none"}} width="45.72" height="26.28"/>
                <g>
                    <polygon
                        style={{fill: "#757575"}}
                        points="-22.86,-6.34 0.07,-6.34 0.07,-13.14 22.86,0 0.07,13.14 0.07,6.34 -22.86,6.34"
                    />
                </g>
            </symbol>
            <circle
                style={{fill: "#FFFFFF", stroke: "#757575", strokeWidth: 5, strokeMiterlimit: 10}}
                cx="80"
                cy="80"
                r="74.68"
            />
            <g>
                <use
                    xlinkHref="#Arrow_26" width="45.72" height="26.28" id="XMLID_1_" x="-22.86" y="-13.14"
                    transform="matrix(1.7329 0 0 -1.7329 82.8319 99.1286)"
                    style={{overflow: "visible"}}
                />
                <use
                    xlinkHref="#Arrow_26"
                    width="45.72"
                    height="26.28"
                    x="-22.86"
                    y="-13.14"
                    transform="matrix(-1.7329 0 0 -1.7329 77.1681 60.8714)"
                    style={{overflow: "visible"}}
                />
            </g>
        </svg>
    );
}
