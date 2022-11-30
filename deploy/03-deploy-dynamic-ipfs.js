const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId

    let priceFeedAddress

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregor = await ethers.getContract("MockV3Aggregator")
        priceFeedAddress = EthUsdAggregor.address
    } else {
        priceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSvg = await fs.readFileSync("./images/dynamicNFT/frown.svg", { encoding: "utf8" })
    const highSvg = await fs.readFileSync("./images/dynamicNFT/happy.svg", { encoding: "utf8" })

    log("--------------")
    const args = [priceFeedAddress, lowSvg, highSvg]
    const dynamicNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicNft.address, args)
    }
    log("........")
}

module.exports.tags = ["all", "dynamicnft", "main"]
