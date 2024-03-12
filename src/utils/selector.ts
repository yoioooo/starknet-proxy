import { keccak } from '@scure/starknet';

import { MASK_250 } from '../constants';
import { BigNumberish } from '../types';
import { addHexPrefix, removeHexPrefix, utf8ToArray } from './encode';
import { hexToBytes, isHex, isStringWholeNumber, toHex, toHexString } from './num';

/**
 * Calculate hex-string keccak hash for a given BigNumberish
 *
 * BigNumberish -> hex-string keccak hash
 * @returns format: hex-string
 */
export function keccakBn(value: BigNumberish): string {
  const hexWithoutPrefix = removeHexPrefix(toHex(BigInt(value)));
  const evenHex = hexWithoutPrefix.length % 2 === 0 ? hexWithoutPrefix : `0${hexWithoutPrefix}`;
  return addHexPrefix(keccak(hexToBytes(addHexPrefix(evenHex))).toString(16));
}

/**
 * Calculate hex-string keccak hash for a given string
 *
 * String -> hex-string keccak hash
 * @returns format: hex-string
 */
function keccakHex(str: string): string {
  return addHexPrefix(keccak(utf8ToArray(str)).toString(16));
}

/**
 * Calculate bigint keccak hash for a given string
 *
 * String -> bigint keccak hash
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/public/abi.py#L17-L22)
 * @param str the value you want to get the keccak hash from
 * @returns starknet keccak hash as BigInt
 */
export function starknetKeccak(str: string): bigint {
  const hash = BigInt(keccakHex(str));
  // eslint-disable-next-line no-bitwise
  return hash & MASK_250;
}

/**
 * Calculate hex-string selector for a given abi-function-name
 *
 * Abi-function-name -> hex-string selector
 *
 * [Reference](https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/starknet/public/abi.py#L25-L26)
 * @param funcName ascii-string of 'abi function name'
 * @returns format: hex-string; selector for 'abi function name'
 */
export function getSelectorFromName(funcName: string) {
  // sometimes BigInteger pads the hex string with zeros, which is not allowed in the starknet api
  return toHex(starknetKeccak(funcName));
}

/**
 * Calculate hex-string selector from abi-function-name, decimal string or hex string
 *
 * ('abi-function-name' or dec-string or hex-string) -> hex-string selector
 *
 * @param value hex-string | dec-string | ascii-string
 * @returns format: hex-string
 */
export function getSelector(value: string) {
  if (isHex(value)) {
    return value;
  }
  if (isStringWholeNumber(value)) {
    return toHexString(value);
  }
  return getSelectorFromName(value);
}
