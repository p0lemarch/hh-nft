const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Tests", function () {
          let basicNft, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["basicnft"])
              basicNft = await ethers.getContract("BasicNft")
          })

          describe("Constructor", () => {
              it("Initializes the NFT Correctly.", async () => {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const counter = await basicNft.getTokenCounter()
                  assert.equal(name, "Doggie")
                  assert.equal(symbol, "DOG")
                  assert.equal(counter.toString(), "0")
              })
          })

          describe("Minting", () => {
              let minter
              beforeEach(async () => {
                  accounts = await ethers.getSigners()
                  minter = accounts[1]
                  const basicNft_minter = basicNft.connect(minter)
                  basicNft_minter.mintNFT()
              })
              it("Allows users to mint an NFT, and updates appropriately", async () => {
                  const counter = await basicNft.getTokenCounter()
                  assert(counter.toString(), "1")
              })
              it("Shows the correct balance and owner of an NFT", async () => {
                  const balance = await basicNft.balanceOf(minter.address)
                  assert(balance.toString(), "1")

                  const owner = await basicNft.ownerOf(0)
                  assert(owner, minter.address)
              })
          })
      })
