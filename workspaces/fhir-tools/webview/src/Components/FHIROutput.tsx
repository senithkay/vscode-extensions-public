import React, { useEffect } from "react";
import Prism from "prismjs";
import 'prismjs/components/prism-json';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import { themes, GlobalStyle } from "../Styles/styles";

export function FHIROutput({ code, theme }: { code: string; theme: string }) {

  useEffect(() => {
    Prism.highlightAll();
  }, [code, theme]);

  return (
    <div>
      <GlobalStyle theme={themes[theme as keyof typeof themes]}/>
      <div className="line-numbers" key={theme}>
        <pre>
          <code className="language-json">
            {code}
          </code>  
        </pre>
      </div>
    </div>
  );
}
