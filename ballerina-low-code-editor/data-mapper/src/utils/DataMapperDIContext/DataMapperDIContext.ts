import {
    injectable, injectAll
  } from 'tsyringe';
import "reflect-metadata";
  
@injectable()
export class DataMapperDIContext {
    constructor(
        @injectAll('NodeFactory')
        public nodeFactories: any[],
        @injectAll('PortFactory')
        public portFactories: any[],
        @injectAll('LinkFactory')
        public linkFactories: any[],
        @injectAll('LabelFactory')
        public labelFactories: any[]
    ) {}
}