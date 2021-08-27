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

@external
def __init__():
    self.owner = msg.sender
    self.name = "Simple Token"
    self.symbol = "SMPL"
    self.totalSupply = 1000000000
    self.balanceOf[self.owner] = self.totalSupply

@external
def transfer(to : address, amount : uint256):
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
