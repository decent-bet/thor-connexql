export const connexSchema = `scalar JSON
scalar Bool
scalar String
# Bytes32 is a 32 byte binary string, represented as 0x-prefixed hexadecimal.
scalar Bytes32
# Address is a 20 byte Ethereum address, represented as 0x-prefixed hexadecimal.
scalar Address
# Bytes is an arbitrary length binary string, represented as 0x-prefixed hexadecimal.
# An empty byte string is represented as '0x'. Byte strings must have an even number of hexadecimal nybbles.
scalar Bytes
# BigInt is a large integer. Input is accepted as either a JSON number or as a string.
# Strings may be either decimal or 0x-prefixed hexadecimal. Output values are all
# 0x-prefixed hexadecimal.
scalar BigInt
# Long is a 64 bit unsigned integer.
scalar Long

schema {
    query: Query
    mutation: Mutation
}

# Account is an Ethereum account at a particular block.
type Account {
    # Address is the address owning the account.
    address: Address!
    # Balance is the balance of the account, in wei.
    balance: BigInt!
    energy: Bytes32
    hasCode: Bool
    # Code contains the smart contract code for this account, if the account
    # is a (non-self-destructed) contract.
    code: Bytes!
    # Storage provides access to the storage of a contract account, indexed
    # by its 32 byte slot identifier.
    # storage(slot: Bytes32!): Bytes32!
}

type Meta {
    blockID: Bytes32
    blockNumber: Long
    blockTimestamp: Long
    txID: Bytes32
    txOrigin: Bytes32
}

# Log is an Ethereum event log.
type Log {
    address: Bytes32
    # Topics is a list of 0-4 indexed topics for the log.
    topics: [Bytes32!]
    # Data is unindexed data for this log.
    data: Bytes 
    meta: Meta
    decoded: JSON
    timestamp: Long
    txDate: String
    logName: String

    sender: Bytes32
    recipient: Bytes32
    amount: Bytes32
}

# Transaction is an Ethereum transaction.
type Transaction {
    # Hash is the hash of this transaction.
    hash: Bytes32!
    # Nonce is the nonce of the account this transaction was generated with.
    nonce: Long!
    # Index is the index of this transaction in the parent block. This will
    # be null if the transaction has not yet been mined.
    index: Int
    # From is the account that sent this transaction - this will always be
    # an externally owned account.
    from(block: Long): Account!
    # To is the account the transaction was sent to. This is null for
    # contract-creating transactions.
    to(block: Long): Account
    # Value is the value, in wei, sent along with this transaction.
    value: BigInt!
    # GasPrice is the price offered to miners for gas, in wei per unit.
    gasPrice: BigInt!
    # Gas is the maximum amount of gas this transaction can consume.
    gas: Long!
    # InputData is the data supplied to the target of the transaction.
    inputData: Bytes!
    # Block is the block this transaction was mined in. This will be null if
    # the transaction has not yet been mined.
    block: Block

    # Status is the return status of the transaction. This will be 1 if the
    # transaction succeeded, or 0 if it failed (due to a revert, or due to
    # running out of gas). If the transaction has not yet been mined, this
    # field will be null.
    status: Long
    # GasUsed is the amount of gas that was used processing this transaction.
    # If the transaction has not yet been mined, this field will be null.
    gasUsed: Long
    # CumulativeGasUsed is the total gas used in the block up to and including
    # this transaction. If the transaction has not yet been mined, this field
    # will be null.
    cumulativeGasUsed: Long
    # CreatedContract is the account that was created by a contract creation
    # transaction. If the transaction was not a contract creation transaction,
    # or it has not yet been mined, this field will be null.
    createdContract(block: Long): Account
    # Logs is a list of log entries emitted by this transaction. If the
    # transaction has not yet been mined, this field will be null.
    logs: [Log!]
}

input Range {
    from: Long
    to: Long
}

input Criteria {
    # Event
    address: Bytes32
    topic0: String
    topic1: Bytes32
    topic2: Bytes32
    topic3: Bytes32
    topic4: Bytes32

    # Transfer
    txOrigin: Bytes32
    sender: Bytes32
    recipient: Bytes32
}

# FilterCriteria encapsulates log filter criteria for searching log entries.
input FilterCriteria {
    kind: String   # event | transfer
    order: String  # asc | desc
    range: Range
    limit: Long
    offset: Long
    criterias: [Criteria]

  # Examples:
  #  - [] or nil          matches any topic list
  #  - [[A]]              matches topic A in first position
  #  - [[], [B]]          matches any topic in first position, B in second position
  #  - [[A], [B]]         matches topic A in first position, B in second position
  #  - [[A, B]], [C, D]]  matches topic (A OR B) in first position, (C OR D) in second position
    # topics: [[Bytes32!]!]
}

input ContractFilterCriteria {
    indexed: JSON
    order: String
    range: Range
    limit: Long
    offset: Long
    criterias: [Criteria]

  # Examples:
  #  - [] or nil          matches any topic list
  #  - [[A]]              matches topic A in first position
  #  - [[], [B]]          matches any topic in first position, B in second position
  #  - [[A], [B]]         matches topic A in first position, B in second position
  #  - [[A, B]], [C, D]]  matches topic (A OR B) in first position, (C OR D) in second position
    # topics: [[Bytes32!]!]
}

type Head {
    id: Bytes32
    number: Long
    timestamp: Long
    parentID: Bytes32
}

type Status {
    progress: Long
    head: Head
}

type Block {
    id: Bytes32
    number: Long
    parentID: Bytes32
    timestamp: Long
    gasLimit: Long
    beneficiary: Bytes32
    gasUsed: Long
    totalScore: Long
    txRoot: Bytes32
    stateRoot: Bytes32
    signer: String
    transactions: [Bytes32]
    isTrunk: Bool
}

type Query {
    # Block fetches an Ethereum block by number or by hash. If neither is
    # supplied, the most recent known block is returned.
    # block(number: Long, hash: Bytes32): Block
    # Blocks returns all the blocks between two numbers, inclusive. If
    # to is not supplied, it defaults to the most recent known block.
    # blocks(from: Long!, to: Long): [Block!]!
    # Pending returns the current pending state.
    # pending: Pending!
    # Transaction returns a transaction specified by its hash.
    # transaction(hash: Bytes32!): Transaction
    # Logs returns log entries matching the provided filter.
    # logs(filter: FilterCriteria!): [Log!]!
    filter(filter:  FilterCriteria!): [Log!]!
    contractFilter(address: Bytes32!,abiSignatures: [String!]!,
    filter:  ContractFilterCriteria!): [Log!]!
    contractRead(address: Bytes32!,abiSignature: String!, params:  Bytes!): JSON
    status: Status
    genesis: Block
    connexVersion: String
    account(address: Address): Account!
}

type Mutation {
    # SendRawTransaction sends an RLP-encoded transaction to the network.
    sendRawTransaction(data: Bytes!): Bytes32!
}`;