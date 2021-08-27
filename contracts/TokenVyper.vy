# @version 0.2.15
# Trying implementation of Token.sol in vyperlang instead.

owner: public(address)
name: public(String[64])
symbol: public(String[32])
totalSupply: public(uint256)
# NOTE: By declaring `balanceOf` as public, vyper automatically generates a 'balanceOf()' getter
#       method to allow access to account balances.
#       The _KeyType will become a required parameter for the getter and it will return _ValueType.
#       See: https://vyper.readthedocs.io/en/v0.1.0-beta.8/types.html?highlight=getter#mappings
balanceOf: public(HashMap[address, uint256])

event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    value: uint256

event TransferOwnership:
    oldOwner: indexed(address)
    newOwner: indexed(address)

@external
def __init__():
    self.owner = msg.sender
    self.name = "Simple Token"
    self.symbol = "SMPL"
    self.totalSupply = 1000000000
    self.balanceOf[self.owner] = self.totalSupply

@internal
def assertOnlyOwner(sender: address):
  assert sender == self.owner, "Must be owner to call"

@external
def transfer(to: address, amount: uint256):
    assert to != ZERO_ADDRESS, "Cannot transfer to zero address"
    assert to != msg.sender, "Cannot transfer to self"
    assert amount > 0, "Transfer amount must be >0"
    # TODO:
    # require(!_frozenAddresses[msg.sender], "Sender address is frozen");
    # require(!_frozenAddresses[to], "Recipient address is frozen");
    assert self.balanceOf[msg.sender] >= amount, "Not enough tokens"

    self.balanceOf[msg.sender] -= amount
    self.balanceOf[to] += amount

    log Transfer(msg.sender, to, amount)

@external
def mint(account: address, amount: uint256):
    self.assertOnlyOwner(msg.sender)
    assert account != ZERO_ADDRESS, "Cannot mint to zero address"

    self.totalSupply += amount
    self.balanceOf[account] += amount

    log Transfer(ZERO_ADDRESS, account, amount)

@external
def burn(account: address, amount: uint256):
    self.assertOnlyOwner(msg.sender)
    assert account != ZERO_ADDRESS, "Cannot burn from zero address"

    accountBalance: uint256 = self.balanceOf[account]
    assert accountBalance >= amount, "Burn amount exceeds balance"

    self.balanceOf[account] = accountBalance - amount
    self.totalSupply -= amount

    log Transfer(account, ZERO_ADDRESS, amount)

@external
def transferOwnership(newOwner: address):
    self.assertOnlyOwner(msg.sender)
    assert newOwner != ZERO_ADDRESS, "New owner cannot be zero address"

    oldOwner: address = self.owner
    self.owner = newOwner

    log TransferOwnership(oldOwner, newOwner)
