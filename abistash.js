#!/usr/bin/env node
const fs = require('fs')
const { ethers } = require('ethers')
const CACHE_DIR = process.env.ABISTASH || process.env.HOME + '/.cache/abistash'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''
const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2'

async function getChainStatus(chainId) {
  const chainlist = await getChainlistCache()
  for (const c in chainlist.result) {
    if (chainlist.result[c].chainid != chainId) continue
    switch (chainlist.result[c].status) {
      case 0:
        console.warn(`chain status offline`)
        return true
      case 1:
        return true
      case 2:
        console.warn(`chain status degraded`)
        return true
      default:
        console.warn(`chain status unknown`)
        return true
    }
  }
  return false
}

async function getChainlist() {
  try {
    const response = await fetch(`${ETHERSCAN_API_URL}/chainlist`)
    if (!response.ok || response.redirected) {
      console.log('not ok or redirected')
      console.log(response)
      return null
    }
    return await response.json()
  } catch (e) {
    console.log(e)
  }
}

async function getChainlistCache() {
  try {
    const cacheFile = `${CACHE_DIR}/chainlist`
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
    }
    const chainlist = await getChainlist() 
    fs.writeFileSync(cacheFile, JSON.stringify(chainlist, null, 2))
    return chainlist
  } catch (e) {
    console.log(e)
  }
}

async function getAbi(chainId, address) {
  try {
    if (!await getChainStatus(chainId)) throw new Error('missing or invalid chainId')
    const response = await fetch(`${ETHERSCAN_API_URL}/api?chainid=${chainId}&module=contract&action=getabi&address=${address}&apikey=${ETHERSCAN_API_KEY}`)
    if (!response.ok || response.redirected) {
      console.log('not ok or redirected')
      console.log(response)
      return null
    }
    const inner = await response.json()
    if (inner.status != 1 || inner.message != 'OK') {
      console.log(`${inner.message}: ${inner.result}`)
      return null
    }
    // status is '1', message is 'OK', result is the payload
    return JSON.parse(inner.result)
  } catch (e) {
    console.log(e)
  }
}

async function getAbiCache(chainId, address) {
  try {
    if (!await getChainStatus(chainId)) throw new Error('missing or invalid chainId')
    const cacheDir = `${CACHE_DIR}/${chainId}`
    const cacheFile = `${cacheDir}/${address}`
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true })
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
    }
    const abi = await getAbi(chainId, address)
    if (abi != null) fs.writeFileSync(cacheFile, JSON.stringify(abi, null, 2))
    return abi
  } catch (e) {
    console.log(e)
  }
}

const shortNameMap = {
  'mainnet': 1,
  'eth': 1,
  'ethereum': 1,
  'sepolia': 11155111,
  'holesky': 17000,
  'hoodi': 560048,
  'bnb': 56,
  'bsc': 56,
  'matic': 137,
  'base': 8453,
  'arb': 42161,
}

function usage() {
  console.log(`usage: abistash [contract address] [optional chain ID or name, default is mainnet]`)
  console.log(`export ETHERSCAN_API_KEY=yourkey     (required)`)
  console.log(`export ABISTASH=~/.cache/abistash    (optional)`)
  console.log(`examples:`)
  console.log(`abistash 0xdAC17F958D2ee523a2206206994597C13D831ec7 mainnet`)
  console.log(`abistash 0xdAC17F958D2ee523a2206206994597C13D831ec7 1`)
}

async function main() {
  if (ETHERSCAN_API_KEY.length != 34) {
    console.log(`ETHERSCAN_API_KEY must contain a valid API key`)
  }
  const targets = process.argv.slice(2)
  if (targets.length < 1) {
    usage()
    process.exit(1)
  }
  let address
  let chainId
  try {
    address = ethers.getAddress(targets[0])
  } catch (e) {
    console.log(e.shortMessage)
    process.exit(1)
  }

  if (targets.length > 1) {
    if (parseInt(targets[1]) > 0) {
      chainId = parseInt(targets[1])
    } else { 
      // lookup name
      if (shortNameMap[targets[1]]) {
        chainId = shortNameMap[targets[1]]
      } else {
        console.log(`no chain ID, specify number or ...`)
        process.exit(1)
      }
    }
  } else {
    chainId = 1
  }

  const abi = await getAbiCache(chainId, address)
  if (abi == null) process.exit(1)

  return 0
}

main()
