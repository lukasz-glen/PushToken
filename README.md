# Decapsulated Governance Tokens

Gas efficient ERC20 governance tokens. One is snapshot, two are vote
and additional two are example tokens.

It is natural that projects look for means to save gas because of 
high transaction costs in Ethereum. 
This is a matter of both usability and functionality.
Minimization of gas usage by contracts can play an important role
in this picture.
This project shows how to optimize governance token contracts.

The general idea is something we could call **decapsulation**.
Object-oriented programming provides the encapsulation concept:
hide implementation details and expose a succinct interface.
We change the perspective: contracts are not object-like mini programs
with business logic, they just control access to the storage with minimal logic.
To control access means to authorize and validate requests.
A part of business logic is moved to a client side. It allows to save
a lot of gas. Note that expensive in terms of gas are storage write,
storage read and external calls.
There is a trade-off of course. The interface exposes low level operations
and is less intuitive. So developing a user friendly client requires more work.

See *direct access to snapshots* here as an example of decapsulation.
In short, the algorithm that searches for a stored record is replaced with
the function in which a user points a record and the contract validates 
it is the right record. 

A governance contract that uses the governance token is burden
with fine grained interface of token. In order to simplify the communication
and reduce the amount of integration logic, we propose *Pushing* concept. 
It is optional and accompanying to decapsulation of governance tokens.
The idea is to revert the direction of passing votes. You can see description
below for more info.

## Install and run

```shell
npm install

npx hardhat compile

npx hardhat test
```

## Contracts

Here are three main contracts.
- *SnapshotToken*. It is similar to *ERC20Snapshot*. A permitted actor
can create a snapshot at any time. A snapshot is created at the moment when 
  *snapshot()* is called. The contract can calculate a balance of a given
  account at a given snapshot.
- *VoteTokenAlpha*. It is similar to *ERC20Votes* and *Comp.sol*. 
There are no snapshots. Every transfer is tracked. A historical balance
  is taken at the end of a block. This protects from using
  flash loans to increase a vote power. 
  We could say that the end of every block is a new snapshot.
  Because we are interested only in
  balances at the end of a block, if there are multiple transfers
  within a single block, only the last change is recorded.
- *VoteTokenBeta*. It is a variant of *VoteTokenAlpha* with elements
of *SnapshotToken*. A permitted actor selects blocks when a snapshot
  is taken. A snapshot is always at the end of block.
  This way checkpoints are created less often.
  
There are auxiliary contracts also.
- *PushingComp*. It is a *Comp.sol* with elements of *VoteTokenAlpha*. 
It shows how the ideas can be applied to existing contracts.
  

## Functionality

This is the overview of relevant functionality. It struggles to be brief
and general so exact function names can differ at the contracts.

*Snapshots*. There is an internal function *_snapshot()*. 
You have to override a contract and add an external function *snapshot()*
or similar with the authorized access of your choice.

*Direct access to snapshots*. There are functions that reads balance (vote power)
at a given snapshot or past block. 
The function *balanceOfAtSnapshot(address account, uint256 snapshotId)*
is used to read recent balance.
The function *balanceOfAtSnapshot(address account, uint256 snapshotId, uint256 snapshotKey)*
is used to read past balance. 
The difference is whether the balance
has changed since the snapshot creation or not.

*Pushing*. The functions *pushSnapshot...()* send a vote to a governance contract.
It is hard to predict a governance contract requirements so 
every pushing function takes the general parameter *data* that encodes a vote.
Some governance requires eth payment or deposit when voting.
In this case you can use the variants *pushSnapshotWithValue()* which are
payable functions.

*Gas Reclaiming*. If a snapshot is no longer useful, for instance 
all governance proposals that referred to the snapshot are closed, 
it can be removed. A user that has recorded balance with the snapshot
can delete the record and reclaim some gas. There is the function
*transferAndReclaimGas()* that transfers tokens cheaper but *_reclaimGas()*
can be used at other operations.

Important data structure. The snapshot id or block number is 6 bytes.
You need to understand what is a snapshot key. It is user address +
opening snapshot id + closing snapshot id. It means that the user had
the same balance between opening snapshot id (inclusive) 
and closing snapshot id (exclusive), and you can check the balance 
having this snapshot key.

## Direct access to snapshots

ERC20 tokens like *Comp* or *ERC20Votes* are implemented to be used in voting.
Capability to get balance at previous blocks is the key functionality.
This approach has drawbacks. The searching algorithms are gas consuming.
The longer history, the higher cost. And the history has to be consistent -
you cannot delete any record in the middle.

The idea is that a user points a record in the history that contains a given block.
So a search algorithm is not needed.
If a record is no longer needed, it can be deleted to get back some gas.
So the user do the search algorithm off-chain, and contract just verifies
that the record is proper.

It does not come for free. A contract with direct access to snapshots is not
well encapsulated. A user/client is required to track history and 
perform search algorithm. Moreover, a user/client depends on implementation
details of a contract. So we have got gas savings in exchange to usability.


## Pushing

Note how usual voting procedure works. 
You have a governance contract and ERC20 contract that serves as votes.
A token holder calls the governance contract in order to vote pro 
or against a proposal. The governance contract subsequently calls ERC20
to find out a balance of token holder at a given block or snapshot.
This balance is the vote power of token holder.
It is pull method because the number of votes is pulled from ERC20 contract
by governance contract.

The direction can be reversed. The procedure would be as follows.
A token holder calls the ERC20 contract 
and it checks the number of token holder's vote power. 
Then it pushes the vote to the governance contract on behalf of the token holder.

With pull method, the governance contract has to decide how to
get the vote power. It is more than a single call, if there is direct
access to snapshots. With push method, the governance contract is not 
burdened with this logic and is more loosely coupled with the ERC20
contract.

There are two things to remember.
- The governance contract has to permit only the ERC20 contract to vote. 
  It has to verify the caller address.
- A token holder has to pass all data to the ERC20 contract in order to vote.
  This includes a vote and proposal id.

## Delegating

*Comp* or *ERC20Votes* support votes delegation. 
In fact, you have to delegate your votes to yourself or someone else
if you want to vote.
Without it, no checkpoint is created and *getPriorVotes()* returns *0*.

It has some good and bad sides. 
Technically, delegating makes checkpoints optional. 
Opted out makes transfers cheaper, so trade is more efficient. This is very important.
But there is a little drawback: even if you did not delegate votes but
a transfer receiver did, then creating a checkpoint on the receiver side is your cost.
Another good point is that votes frozen in DEXes and CEXes are opted out.
The bad side is that it discourages to participate in governance.
It is important now when many projects struggle for attendance in governance.

In *VoteTokenAlpha* and *VoteTokenBeta* implementations there is no delegating,
you cannot opt out from creating checkpoints.
I do not say it is better, it is up to you.
Implementations are a little easier this way, 
but it is not a big thing to add delegating.

## Pushing Comp contract

It is possible to use pushing, gas reclaiming and direct access to snapshots
with *Comp* or *ERC20Votes*. *PushingComp.sol* is provided 
as an example of such implementation with *Comp*. This is rather easy but has two drawbacks
- It is more difficult to recover an id of interesting checkpoint. 
  Just reading events is not enough. Still, it is possible.
- The provided implementation does not support gas reclaim. 
  This is because it would break *getPriorVotes()* algorithm. 
  Adjusting the algorithm requires more work.

## Tests

Test scripts are for functional tests, usage demonstration and gas consumption comparison.
You can use _.only(...)_ to selectively enable a test and check results.

- **snapshot-test** Functional tests for SnapshotToken
- **snapshot-transfer** Comparison of gas consumption of plain transfers between SnapshotToken and OZ ERC20Snapshot
- **snapshot-logs** Demonstration how to reconstruct snapshot keys of SnapshotToken from blockchain events
- **snapshot-snapshot** Comparison of gas consumption of snapshots and transfers between SnapshotToken and OZ ERC20Snapshot
- **vote-alpha-test** Functional tests for VoteTokenAlpha
- **vote-alpha-transfer** Comparison of gas consumption of plain transfers between VoteTokenAlpha and OZ ERC20Votes and c-p Comp,
  all transfers are between accounts that delegated votes to themselves
- **vote-alpha-logs** Demonstration how to reconstruct snapshot keys of VoteTokenAlpha from blockchain events
- **vote-beta-test** Functional tests for VoteTokenBeta
- **vote-beta-transfer** Comparison of gas consumption of plain transfers between VoteTokenBeta and OZ ERC20Votes and c-p Comp,
  all transfers are between accounts that delegated votes to themselves, 
  in case of VoteTokenBeta a snapshot is taken before each transfer 
- **push-test** Functional tests for Push extension based on SnapshotToken
- **pushing-comp-test** Tests for Push extension to Comp contract

## Licensing

Code is distributed under MIT license with an exception.
*Comp.sol* is redistributed under *BSD 3-Clause "New" or "Revised" License* from Compound Labs.


## TODO

- Governance Beta example, with a snapshot in the future
- document comparison to ERC20Snapshot and Compound
- rename repo
- slither
- missing test for many transfers within one block