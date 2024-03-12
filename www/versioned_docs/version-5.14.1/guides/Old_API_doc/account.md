---
sidebar_position: 2
---

# Account

An Account extends <ins>[`Provider`](./Provider)</ins> and inherits all of its methods.

It also introduces new methods that allow Accounts to create and verify signatures with a custom <ins>[`Signer`](./Signer)</ins>, declare and deploy Contract and deploy new Account

This API is the primary way to interact with an account contract on Starknet.

## Creating an instance

To create a new instance of the Account, first an account contract must be deployed. Also there needs to be a Provider instance that will be passed in the constructor and key pair for the account.

`new starknet.Account(Provider, address, pk)`

## Properties

account.**address** => _string_

The address of the account contract.

## Methods

### getNonce()

account.**getNonce(blockIdentifier)** => _Promise < BigNumberish >_

Gets the nonce of the account with respect to a specific block.

_blockIdentifier_ - optional blockIdentifier. Defaults to 'pending'.

Returns the nonce of the account.

---

### estimateInvokeFee()

account.**estimateInvokeFee**(calls [ , estimateFeeDetails ]) => _Promise < EstimateFeeResponse >_

Estimate Fee for executing an INVOKE transaction on Starknet.

The _calls_ object structure:

- calls.**contractAddress** - Address of the contract
- calls.**entrypoint** - Entrypoint of the call (method name)
- calls.**calldata** - Payload for the invoking method

The _estimateFeeDetails_ object may include any of:

- estimateFeeDetails.**blockIdentifier** - Block Identifier for the transaction
- estimateFeeDetails.**nonce** - Nonce for the transaction

###### _EstimateFeeResponse_

```typescript
{
  overall_fee: BN;
  gas_consumed?: BN;
  gas_price?: BN;
}
```

---

### estimateDeclareFee()

account.**estimateDeclareFee**(contractPayload [ , estimateFeeDetails ]) => _Promise < EstimateFeeResponse >_

Estimate Fee for executing a DECLARE transaction on Starknet.

The _contractPayload_ object structure:

- contractPayload.**contract** - The compiled contract
- contractPayload.**classHash** - This can be obtained by using starknet-cli. Once the classHash is included in CompiledContract, this can be removed

The _estimateFeeDetails_ object may include any of:

- estimateFeeDetails.**blockIdentifier** - Block Identifier for the transaction
- estimateFeeDetails.**nonce** - Nonce for the transaction

###### _EstimateFeeResponse_

```typescript
{
  overall_fee: BN;
  gas_consumed?: BN;
  gas_price?: BN;
}
```

---

### estimateAccountDeployFee()

account.**estimateAccountDeployFee**(contractPayload [ , estimateFeeDetails ]) => _Promise < EstimateFeeResponse >_

Estimate Fee for executing a DEPLOY_ACCOUNT transaction on Starknet

The _contractPayload_ object structure:

- contractPayload.**contract** - The compiled contract to be declared
- contractPayload.**classHash** - This can be obtained by using starknet-cli. Once the classHash is included in CompiledContract, this can be removed

The _estimateFeeDetails_ object may include any of:

- estimateFeeDetails.**blockIdentifier** - Block Identifier for the transaction
- estimateFeeDetails.**nonce** - Nonce for the transaction

###### _EstimateFeeResponse_

```typescript
{
  overall_fee: BN;
  gas_consumed?: BN;
  gas_price?: BN;
}
```

---

### estimateFeeBulk()

account.**estimateFeeBulk**(transaction[] [ , estimateFeeDetails ]) => _Promise < EstimateFeeResponse[] >_

Estimate Fee for executing a list of transactions on starknet.

The _transaction_ object structure:

- transaction.**type** - the type of transaction: 'DECLARE' | 'DEPLOY' | 'INVOKE_FUNCTION' | 'DEPLOY_ACCOUNT'
- transaction payload - the payload for the transaction

The _estimateFeeDetails_ object may include any of:

- estimateFeeDetails.**blockIdentifier** - Block Identifier for the transaction
- estimateFeeDetails.**nonce** - Nonce for the transaction

###### _EstimateFeeResponse_

```typescript
{
  overall_fee: BN;
  gas_consumed?: BN;
  gas_price?: BN;
}
```

---

### execute()

account.**execute**(transactions [ , abi , transactionsDetail ]) => _Promise < InvokeFunctionResponse >_

Executes one or multiple calls using the account contract. If there is only one call, _transactions_ will be an object that contains parameters below. If there are multiple calls, _transactions_ will be an array that contains several objects mentioned above.

The _transactions_ object structure:

- contractPayload.**contractAddress** - the address of the contract
- contractPayload.**entrypoint** - the entrypoint of the contract
- contractPayload.**calldata** - (defaults to []) the calldata
- contractPayload.**signature** - (defaults to []) the signature

_abi_ - (optional) the abi of the contract for better displaying

The _transactionsDetail_ object may include any of:

- transactionsDetail.**maxFee** - Max Fee that that will be used to execute the call(s)
- transactionsDetail.**nonce** - Nonce for the transaction
- transactionsDetail.**version** - Version for the transaction (default is 1)

Example:

```typescript
// When there is only one call
const call = await account.execute(
  {
    contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',  // ETH contract address
    entrypoint: 'approve',
    calldata: starknet.CallData.compile(
      {
        spender: "0x15e90f807a00a01df845460324fbcd33986f2df3cc9d981e9e8b5005b7f595e",
        amount: {
          type: 'struct',
          low: '1',   // 1 wei
          high: '0',
        }
      }
    ),
  },
  undefined,
  {
    nonce: '10',
  }
);

// When there are multiple calls
const multiCall = await account.execute(
  [
    {
      contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',  // ETH contract address
      entrypoint: 'approve',
      calldata: starknet.CallData.compile(
        {
          spender: "0x15e90f807a00a01df845460324fbcd33986f2df3cc9d981e9e8b5005b7f595e",
          amount: {
            type: 'struct',
            low: '1',   // 1 wei
            high: '0',
          }
        }
      ),
    },
    {
      contractAddress: '0x15e90f807a00a01df845460324fbcd33986f2df3cc9d981e9e8b5005b7f595e',
      entrypoint: 'transfer_ether',
      calldata: ['1', '0'],  // 1 wei
    }
  ],
  undefined,
  {
    nonce: '10',
  }
);
```

###### _InvokeFunctionResponse_

```typescript
{
  transaction_hash: string;
};
```

---

### declare()

account.**declare**(contractPayload [ , transactionsDetail ]) => _Promise < DeclareContractResponse >_

Declares a given compiled contract (json) to starknet.

The _contractPayload_ object consists of:

- contractPayload.**contract** - The compiled contract
- contractPayload.**classHash** - Hash of the compiled contract

The _transactionsDetail_ object may include any of:

- transactionsDetail.**maxFee** - Max Fee that that will be used to execute the call(s)
- transactionsDetail.**nonce** - Nonce for the transaction
- transactionsDetail.**version** - Version for the transaction (default is 1)

> _Note:_ Once the classHash is included in CompiledContract, this parameter can be removed. Currently it can be pre-computed from starknet-cli.

Example:

```typescript
const declareTx = await account.declare({
  contract: compiledErc20,
  // classHash is pre-computed from starknet-cli
  classHash: '0x54328a1075b8820eb43caf0caa233923148c983742402dcfc38541dd843d01a',
});
```

###### _DeclareContractResponse_

```typescript
{
  transaction_hash: string;
  class_hash: string;
};
```

---

### deploy()

Deploys a given compiled contract (json) to starknet, wrapper around _execute_ invoke function

account.**deploy**(deployContractPayload [ , transactionsDetail ]) => _Promise < InvokeFunctionResponse >_

@param object **_deployContractPayload_**

- **classHash**: computed class hash of compiled contract
- optional constructorCalldata: constructor calldata
- optional salt: address salt - default random
- optional unique: bool if true ensure unique salt - default true

@param object **transactionsDetail** Invocation Details

- optional nonce
- optional version
- optional maxFee

@returns **transaction_hash**

Example:

```typescript
  const deployment = await account.deploy({
    classHash: erc20ClassHash,
    constructorCalldata: [
      encodeShortString('Token'),
      encodeShortString('ERC20'),
      account.address,
    ],
    salt: randomAddress(),
    unique: true, // Using true here so as not to clash with normal erc20 deploy in account and provider test
  });

  await provider.waitForTransaction(deployment.transaction_hash);
```

Example multi-call:

```typescript
TODO Example with multi-call
```

---

### deployContract()

✅ NEW
High level wrapper for deploy. Doesn't require waitForTransaction. Response similar to deprecated provider deployContract.

account.**deployContract**(payload [ , details ]) => _Promise < DeployContractUDCResponse >_

@param object **_payload_** UniversalDeployerContractPayload

- **classHash**: computed class hash of compiled contract
- **constructorCalldata**: constructor calldata
- optional salt: address salt - default random
- optional unique: bool if true ensure unique salt - default true

@param object **details** InvocationsDetails

- optional nonce
- optional version
- optional maxFee

@returns Promise DeployContractUDCResponse

- contract_address
- transaction_hash
- address
- deployer
- unique
- classHash
- calldata_len
- calldata
- salt

Example:

```typescript
  const deployResponse = await account.deployContract({
    classHash: erc20ClassHash,
    constructorCalldata: [
      encodeShortString('Token'),
      encodeShortString('ERC20'),
      account.address,
    ],
  });
```

---

### declareAndDeploy()

✅ NEW
High level wrapper for declare & deploy. Doesn't require waitForTransaction. Functionality similar to deprecated provider deployContract. Declare and Deploy contract using single function.

account.**declareAndDeploy**(payload [ , details ]) => _Promise < DeclareDeployUDCResponse >_

@param object **_payload_** DeclareDeployContractPayload

- **contract**: compiled contract code
- optional computed class hash of compiled contract
- optional constructorCalldata: constructor calldata
- optional salt: address salt - default random
- optional unique: bool if true ensure unique salt - default true

@param object **details** InvocationsDetails

- optional nonce
- optional version
- optional maxFee

@returns Promise DeclareDeployUDCResponse

- declare: CommonTransactionReceiptResponse
  - transaction_hash
  - class_hash
- deploy: DeployContractUDCResponse;
  - contract_address
  - transaction_hash
  - address
  - deployer
  - unique
  - classHash
  - calldata_len
  - calldata
  - salt
  ***

Example:

```typescript
  const declareDeploy = await account.declareDeploy({
    contract: compiledErc20,
    constructorCalldata: [
      encodeShortString('Token'),
      encodeShortString('ERC20'),
      account.address,
    ],
  });

  const declareTransactionHash = declareDeploy.declare.transaction_hash
  const erc20Address = declareDeploy.deploy.contract_address;
```

---

### deployAccount()

account.**deployAccount**(contractPayload [ , transactionsDetail ]) => _Promise < DeployContractResponse >_

Declares a given compiled contract (json) to starknet.

The _contractPayload_ object consists of:

- contractPayload.**classHash** - Hash of the compiled contract
- contractPayload.**constructorCalldata** - optional
- contractPayload.**addressSalt** - optional
- contractPayload.**contractAddress** - optional

The _transactionsDetail_ object may include any of:

- transactionsDetail.**maxFee** - Max Fee that that will be used to execute the call(s)
- transactionsDetail.**nonce** - Nonce for the transaction
- transactionsDetail.**version** - Version for the transaction (default is 1)

> _Note:_ Once the classHash is included in CompiledContract, this parameter can be removed. Currently it can be pre-computed from starknet-cli.

###### _DeployContractResponse_

```typescript
{
  contract_address: string;
  transaction_hash: string;
};
```

---

### signMessage()

account.**signMessage**(typedData) => _Promise < Signature >_

Sign an JSON object for off-chain usage with the starknet private key and return the signature. This adds a message prefix so it cant be interchanged with transactions.

_typedData_ - JSON object to be signed

###### _Signature_

```typescript
string[];
```

---

### hashMessage()

account.**hashMessage**(typedData) => _Promise < string >_

Hash a JSON object with pederson hash and return the hash. This adds a message prefix so it cant be interchanged with transactions.

_typedData_ - JSON object to be signed

Returns the hash of the JSON object.

---

### verifyMessageHash()

account.**verifyMessageHash**(hash, signature) => _Promise < boolean >_

Verify a signature of a given hash.

> **WARNING**
>
> This method is not recommended, use `verifyMessage` instead

---

### verifyMessage()

account.**verifyMessage**(typedData, signature) => _Promise < boolean >_

Verify a signature of a JSON object.

_typedData_ - JSON object to be verified
_signature_ - signature of the JSON object

Returns true if the signature is valid, false otherwise

---

### getSuggestedMaxFee()

account.**getSuggestedMaxFee**(estimateFeeAction, details) => _Promise < BigNumberish >_

Gets Suggested Max Fee based on the transaction type.

The _details_ object may include any of:

- details.**blockIdentifier**
- details.**nonce**

---

### getStarkName()

account.**getStarkName**(address, StarknetIdContract) => _Promise<string | Error>_

Gets starknet.id stark name with the address provided, if `undefined` uses the address of the account

The _StarknetIdContract_ argument can be undefined, if it is, the function will automatically use official starknet id contracts of your network.

Returns directly a string (Example: `vitalik.stark`).

---

### simulateTransaction()

account.**simulateTransaction**(calls [ , estimateFeeDetails ]) => _Promise < TransactionSimulationResponse >_

Simulates the transaction and returns the transaction trace and estimated fee.

###### _TransactionSimulationResponse_

```typescript
{
  trace: TransactionTraceResponse;
  fee_estimation: EstimateFee;
}
```
