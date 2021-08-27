// SPDX-License-Identifier: ISC
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.7;

// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    // The `public` modifier makes a variable readable from outside the contract.
    string public name = "Simple Token";
    string public symbol = "SMPL";

    // The fixed amount of tokens stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account balance.
    mapping(address => uint256) private _balances;

    // A mapping of frozen addresses.
    mapping(address => bool) private _frozenAddresses;

    modifier adminOnly() {
        require(owner == msg.sender, "Must be owner to call this function");
        _;
    }

    /**
     * Contract initialization.
     *
     * The `constructor` is executed only once when the contract is created.
     */
    constructor() {
        // The totalSupply is assigned to transaction sender, which is the account
        // that is deploying the contract.
        _balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from outside
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to self");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(!_frozenAddresses[msg.sender], "Sender address is frozen");
        require(!_frozenAddresses[to], "Recipient address is frozen");

        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(_balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function adminFreeze(address account) external adminOnly {
        _frozenAddresses[account] = true;
    }

    function adminUnfreeze(address account) external adminOnly {
        _frozenAddresses[account] = false;
    }

    function isFrozen(address account) external view returns (bool) {
        return _frozenAddresses[account];
    }
}
