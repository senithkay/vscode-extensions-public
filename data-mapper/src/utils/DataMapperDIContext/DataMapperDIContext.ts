import {
    injectable, injectAll
  } from 'tsyringe';
import "reflect-metadata";
import { IDataMapperNodeFactory } from '../../components/Diagram/Node/model/DataMapperNode';
  
@injectable()
export class DataMapperDIContext {
    constructor(
        @injectAll('NodeFactory')
        public nodeFactories: IDataMapperNodeFactory[]
    ) {}
}