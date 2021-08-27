// SPDX-License-Identifier: ISC
pragma solidity ^0.8.4;

contract Token {
    // Some string type variables to identify the token.
    // The `public` modifier makes a variable readable from outside the contract.
    string public name = 'Simple Token';
    string public symbol = 'SMPL';

    // The fixed amount of tokens stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account balance.
    mapping(address => uint256) private _balances;

    // A mapping of frozen addresses.
    mapping(address => bool) private _frozenAddresses;

    modifier onlyOwner() {
        require(owner == msg.sender, 'Must be owner to call');
        _;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Freeze(address indexed account);
    event Unfreeze(address indexed account);
    event TransferOwnership(address indexed oldOwner, address indexed newOwner);

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
        require(to != address(0), 'Cannot transfer to zero address');
        require(to != msg.sender, 'Cannot transfer to self');
        require(amount > 0, 'Transfer amount must be >0');
        require(!_frozenAddresses[msg.sender], 'Sender address is frozen');
        require(!_frozenAddresses[to], 'Recipient address is frozen');

        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(_balances[msg.sender] >= amount, 'Not enough tokens');

        // Transfer the amount.
        _balances[msg.sender] -= amount;
        _balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
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

    /** Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     */
    function mint(address account, uint256 amount) external onlyOwner {
        require(account != address(0), 'Cannot mint to zero address');

        totalSupply += amount;
        _balances[account] += amount;

        emit Transfer(address(0), account, amount);
    }

    /**
     *  Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     */
    function burn(address account, uint256 amount) external onlyOwner {
        require(account != address(0), 'Cannot burn from zero address');

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, 'Burn amount exceeds balance');

        _balances[account] = accountBalance - amount;
        totalSupply -= amount;

        emit Transfer(account, address(0), amount);
    }

    function freeze(address account) external onlyOwner {
        _frozenAddresses[account] = true;
        emit Freeze(account);
    }

    function unfreeze(address account) external onlyOwner {
        _frozenAddresses[account] = false;
        emit Unfreeze(account);
    }

    function isFrozen(address account) external view returns (bool) {
        return _frozenAddresses[account];
    }

    /**
     * Allows the current owner to transfer control of the contract to a newOwner.
     * newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), 'New owner cannot be zero address');

        address oldOwner = owner;
        owner = newOwner;

        emit TransferOwnership(oldOwner, newOwner);
    }
}
