import { Abi, FunctionAbi } from '../../../types';
import { AbiParserInterface } from './interface';

export class AbiParser2 implements AbiParserInterface {
  abi: Abi;

  constructor(abi: Abi) {
    this.abi = abi;
  }

  /**
   * abi method inputs length
   * @param abiMethod FunctionAbi
   * @returns number
   */
  public methodInputsLength(abiMethod: FunctionAbi) {
    return abiMethod.inputs.length;
  }

  /**
   * get method definition from abi
   * @param name string
   * @returns FunctionAbi | undefined
   */
  public getMethod(name: string): FunctionAbi | undefined {
    const intf = this.abi.find((it) => it.type === 'interface');
    return intf.items.find((it: any) => it.name === name);
  }

  /**
   * Get Abi in legacy format
   * @returns Abi
   */
  public getLegacyFormat(): Abi {
    return this.abi.flatMap((e) => {
      if (e.type === 'interface') {
        return e.items;
      }
      return e;
    });
  }
}
