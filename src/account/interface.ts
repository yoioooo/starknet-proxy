import { ProviderInterface } from '../provider';
import { SignerInterface } from '../signer';
import {
  Abi,
  AllowArray,
  BigNumberish,
  BlockIdentifier,
  CairoVersion,
  Call,
  DeclareAndDeployContractPayload,
  DeclareContractPayload,
  DeclareContractResponse,
  DeclareDeployUDCResponse,
  DeployAccountContractPayload,
  DeployContractResponse,
  DeployContractUDCResponse,
  EstimateFeeAction,
  EstimateFeeDetails,
  EstimateFeeResponse,
  EstimateFeeResponseBulk,
  Invocations,
  InvocationsDetails,
  InvokeFunctionResponse,
  MultiDeployContractResponse,
  Nonce,
  Signature,
  SimulateTransactionDetails,
  SimulateTransactionResponse,
  TypedData,
  UniversalDeployerContractPayload,
} from '../types';

export abstract class AccountInterface extends ProviderInterface {
  public abstract address: string;

  public abstract signer: SignerInterface;

  public abstract cairoVersion: CairoVersion;

  /**
   * Estimate Fee for executing an INVOKE transaction on starknet
   *
   * @param calls the invocation object containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   *
   * @returns response from estimate_fee
   */
  public abstract estimateInvokeFee(
    calls: AllowArray<Call>,
    estimateFeeDetails?: EstimateFeeDetails
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimate Fee for executing a DECLARE transaction on starknet
   *
   * @param contractPayload the payload object containing:
   * - contract - the compiled contract to be declared
   * - classHash - the class hash of the compiled contract. This can be obtained by using starknet-cli.
   *
   * @returns response from estimate_fee
   */
  public abstract estimateDeclareFee(
    contractPayload: DeclareContractPayload,
    estimateFeeDetails?: EstimateFeeDetails
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimate Fee for executing a DEPLOY_ACCOUNT transaction on starknet
   *
   * @param contractPayload -
   * - contract - the compiled contract to be deployed
   * - classHash - the class hash of the compiled contract. This can be obtained by using starknet-cli.
   * @param estimateFeeDetails -
   * - optional blockIdentifier
   * - constant nonce = 0
   * @returns response from estimate_fee
   */
  public abstract estimateAccountDeployFee(
    contractPayload: DeployAccountContractPayload,
    estimateFeeDetails?: EstimateFeeDetails
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimate Fee for executing a UDC DEPLOY transaction on starknet
   * This is different from the normal DEPLOY transaction as it goes through the Universal Deployer Contract (UDC)
   
  * @param deployContractPayload containing
   * - classHash: computed class hash of compiled contract
   * - salt: address salt
   * - unique: bool if true ensure unique salt
   * - calldata: constructor calldata
   * 
   * @param transactionsDetail Invocation Details containing:
   *  - optional nonce
   *  - optional version
   *  - optional maxFee
   */
  public abstract estimateDeployFee(
    deployContractPayload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
    transactionsDetail?: InvocationsDetails
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimate Fee for executing a list of transactions on starknet
   * Contract must be deployed for fee estimation to be possible
   *
   * @param transactions array of transaction object containing :
   * - type - the type of transaction : 'DECLARE' | (multi)'DEPLOY' | (multi)'INVOKE_FUNCTION' | 'DEPLOY_ACCOUNT'
   * - payload - the payload of the transaction
   *
   * @returns response from estimate_fee
   */
  public abstract estimateFeeBulk(
    invocations: Invocations,
    details?: EstimateFeeDetails
  ): Promise<EstimateFeeResponseBulk>;

  /**
   * Invoke execute function in account contract
   *
   * @param transactions the invocation object or an array of them, containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * @param abi (optional) the abi of the contract for better displaying
   *
   * @returns response from addTransaction
   */
  public abstract execute(
    transactions: AllowArray<Call>,
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails
  ): Promise<InvokeFunctionResponse>;

  /**
   * Declares a given compiled contract (json) to starknet
   * 
   * @param contractPayload transaction payload to be deployed containing:
  - contract: compiled contract code
  - (optional) classHash: computed class hash of compiled contract. Pre-compute it for faster execution.
  - (required for Cairo1 without compiledClassHash) casm: CompiledContract | string;
  - (optional for Cairo1 with casm) compiledClassHash: compiled class hash from casm. Pre-compute it for faster execution.
   * @param transactionsDetail Invocation Details containing:
  - optional nonce
  - optional version
  - optional maxFee
   * @returns a confirmation of sending a transaction on the starknet contract
   */
  public abstract declare(
    contractPayload: DeclareContractPayload,
    transactionsDetail?: InvocationsDetails
  ): Promise<DeclareContractResponse>;

  /**
   * Deploys a declared contract to starknet - using Universal Deployer Contract (UDC)
   * support multicall
   *
   * @param payload -
   * - classHash: computed class hash of compiled contract
   * - [constructorCalldata] contract constructor calldata
   * - [salt=pseudorandom] deploy address salt
   * - [unique=true] ensure unique salt
   * @param details -
   * - [nonce=getNonce]
   * - [version=transactionVersion]
   * - [maxFee=getSuggestedMaxFee]
   * @returns
   * - contract_address[]
   * - transaction_hash
   */
  public abstract deploy(
    payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
    details?: InvocationsDetails | undefined
  ): Promise<MultiDeployContractResponse>;

  /**
   * Simplify deploy simulating old DeployContract with same response + UDC specific response
   * Internal wait for L2 transaction, support multicall
   *
   * @param payload -
   * - classHash: computed class hash of compiled contract
   * - [constructorCalldata] contract constructor calldata
   * - [salt=pseudorandom] deploy address salt
   * - [unique=true] ensure unique salt
   * @param details -
   * - [nonce=getNonce]
   * - [version=transactionVersion]
   * - [maxFee=getSuggestedMaxFee]
   * @returns
   *  - contract_address
   *  - transaction_hash
   *  - address
   *  - deployer
   *  - unique
   *  - classHash
   *  - calldata_len
   *  - calldata
   *  - salt
   */
  public abstract deployContract(
    payload: UniversalDeployerContractPayload | UniversalDeployerContractPayload[],
    details?: InvocationsDetails | undefined
  ): Promise<DeployContractUDCResponse>;

  /**
   * Declares and Deploy a given compiled contract (json) to starknet using UDC
   * Internal wait for L2 transaction, do not support multicall
   * Method will pass even if contract is already declared (internal using DeclareIfNot)
   *
   * @param payload
   * - contract: compiled contract code
   * - [casm=cairo1]: CairoAssembly | undefined;
   * - [compiledClassHash]: string | undefined;
   * - [classHash]: computed class hash of compiled contract
   * - [constructorCalldata] contract constructor calldata
   * - [salt=pseudorandom] deploy address salt
   * - [unique=true] ensure unique salt
   * @param details
   * - [nonce=getNonce]
   * - [version=transactionVersion]
   * - [maxFee=getSuggestedMaxFee]
   * @returns
   * - declare
   *    - transaction_hash
   * - deploy
   *    - contract_address
   *    - transaction_hash
   *    - address
   *    - deployer
   *    - unique
   *    - classHash
   *    - calldata_len
   *    - calldata
   *    - salt
   */
  public abstract declareAndDeploy(
    payload: DeclareAndDeployContractPayload,
    details?: InvocationsDetails | undefined
  ): Promise<DeclareDeployUDCResponse>;

  /**
   * Deploy the account on Starknet
   * 
   * @param contractPayload transaction payload to be deployed containing:
  - classHash: computed class hash of compiled contract
  - optional constructor calldata
  - optional address salt  
  - optional contractAddress
   * @param transactionsDetail Invocation Details containing:
  - constant nonce = 0
  - optional version
  - optional maxFee
   * @returns a confirmation of sending a transaction on the starknet contract
   */
  public abstract deployAccount(
    contractPayload: DeployAccountContractPayload,
    transactionsDetail?: InvocationsDetails
  ): Promise<DeployContractResponse>;

  /**
   * Sign an JSON object for off-chain usage with the starknet private key and return the signature
   * This adds a message prefix so it cant be interchanged with transactions
   *
   * @param json - JSON object to be signed
   * @returns the signature of the JSON object
   * @throws {Error} if the JSON object is not a valid JSON
   */
  public abstract signMessage(typedData: TypedData): Promise<Signature>;

  /**
   * Hash a JSON object with pederson hash and return the hash
   * This adds a message prefix so it cant be interchanged with transactions
   *
   * @param json - JSON object to be hashed
   * @returns the hash of the JSON object
   * @throws {Error} if the JSON object is not a valid JSON
   */
  public abstract hashMessage(typedData: TypedData): Promise<string>;

  /**
   * Verify a signature of a JSON object
   *
   * @param typedData - JSON object to be verified
   * @param signature - signature of the JSON object
   * @returns true if the signature is valid, false otherwise
   * @throws {Error} if the JSON object is not a valid JSON or the signature is not a valid signature
   */
  public abstract verifyMessage(typedData: TypedData, signature: Signature): Promise<boolean>;

  /**
   * Verify a signature of a given hash
   * @warning This method is not recommended, use verifyMessage instead
   *
   * @param hash - hash to be verified
   * @param signature - signature of the hash
   * @returns true if the signature is valid, false otherwise
   * @throws {Error} if the signature is not a valid signature
   */
  public abstract verifyMessageHash(hash: BigNumberish, signature: Signature): Promise<boolean>;

  /**
   * Gets the nonce of the account with respect to a specific block
   *
   * @param  {BlockIdentifier} blockIdentifier - optional blockIdentifier. Defaults to 'pending'
   * @returns nonce of the account
   */
  public abstract getNonce(blockIdentifier?: BlockIdentifier): Promise<Nonce>;

  /**
   * Gets Suggested Max Fee based on the transaction type
   *
   * @param  {EstimateFeeAction} estimateFeeAction
   * @param  {EstimateFeeDetails} details
   * @returns suggestedMaxFee
   */
  public abstract getSuggestedMaxFee(
    estimateFeeAction: EstimateFeeAction,
    details: EstimateFeeDetails
  ): Promise<bigint>;

  /**
   * Simulates an array of transaction and returns an array of transaction trace and estimated fee.
   *
   * @param invocations Invocations containing:
   * - type - transaction type: DECLARE, (multi)DEPLOY, DEPLOY_ACCOUNT, (multi)INVOKE_FUNCTION
   * @param details SimulateTransactionDetails
   *
   * @returns response from simulate_transaction
   */
  public abstract simulateTransaction(
    invocations: Invocations,
    details?: SimulateTransactionDetails
  ): Promise<SimulateTransactionResponse>;
}
