import * as React from "react";
import { SVGProps } from "react";

export const BitBucketIcon = (props: SVGProps<SVGSVGElement> & { color?: string }) => {
  const { color = "var(--vscode-foreground)", ...rest } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="auto"
      height="100%"
      viewBox="0 0 50 50"
      preserveAspectRatio="xMidYMid"
      style={{ transform: "scale(1.4)" }}
      fill="none"
      {...rest}
    >
      <path
        fill="url(#a)"
        d="M 42.109375 19.113281 L 30.871094 19.113281 L 28.996094 30.167969 L 21.191406 30.167969 L 12.011719 41.09375 C 12.011719 41.09375 12.449219 41.46875 13.074219 41.46875 L 37.550781 41.46875 C 38.113281 41.46875 38.613281 41.03125 38.738281 40.46875 Z M 42.109375 19.113281 "
      />
      <path
        fill={color}
        d="M 7.453125 7.8125 C 6.703125 7.8125 6.140625 8.5 6.265625 9.1875 L 11.324219 40.15625 C 11.386719 40.53125 11.574219 40.90625 11.886719 41.15625 C 11.886719 41.15625 12.324219 41.53125 12.949219 41.53125 L 22.441406 30.167969 L 21.128906 30.167969 L 19.066406 19.113281 L 42.109375 19.113281 L 43.734375 9.1875 C 43.859375 8.4375 43.296875 7.8125 42.546875 7.8125 Z M 7.453125 7.8125 "
      />
      <defs>
        <linearGradient id="a" x1={27.898} x2={16.618} y1={15.387} y2={23.023} gradientUnits="userSpaceOnUse">
          <stop offset={0.072} stopColor={color} stopOpacity={0.4} />
          <stop offset={1} stopColor={color} />
        </linearGradient>
      </defs>
    </svg>
  );
};
