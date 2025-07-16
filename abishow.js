#!/usr/bin/env node
const fs = require('fs')
//const { ethers } = require('ethers')
const CACHE_DIR = process.env.ABISTASH || process.env.HOME + '/.cache/abistash'

function fmtInputs(inputs) {
  let result = ""
  for (const i of inputs) {
    if (i.name == '') {
      result = result + `${i.type}, `
    } else {
      result = result + `${i.type} ${i.name}, `
    }
  }
  result = result.trimEnd()
  return result.substring(0, result.length - 1);
}

function usage() {
  console.log(`usage: abishow [contract address|name] [optional chain ID or name, default is mainnet]`)
  console.log(`export ABISTASH=~/.cache/abistash    (optional)`)
  console.log(`examples:`)
  console.log(`abishow 0xdAC17F958D2ee523a2206206994597C13D831ec7 mainnet`)
  console.log(`abishow USDT`)
  console.log(`abishow USDT 1`)
}

async function main() {
  const target = process.argv.slice(2)
  if (target.length < 1) {
    usage()
    process.exit(1)
  }

  let beaconUpgradable = 0
  let abi
  try {
    if (target[0].startsWith('0x')) {
      const chain = target[1] || 1
      abi = JSON.parse(fs.readFileSync(`${CACHE_DIR}/${chain}/${target[0]}`))
    } else {
      abi = JSON.parse(fs.readFileSync(`${CACHE_DIR}/named/${target[0]}`))
    }
  } catch (e) {
    console.log(`Can't open ${target[0]}`)
    process.exit(1)
  }
  for (const decl of abi) {
    let args = ''
    switch (decl.type) {
      case 'constructor':
        args = fmtInputs(decl.inputs)
        console.log(`${decl.type} (${args}) ${decl.stateMutability || ''}`)
        break
      case 'fallback':
        break
      case 'receive':
        break
      case 'event':
        args = fmtInputs(decl.inputs)
        declText = `${decl.type} ${decl.name}(${args}) ${decl.stateMutability || ''}`
        console.log(declText)
        if (declText.startsWith('event AdminChanged(address previousAdmin, address newAdmin)')
            || declText.startsWith('event BeaconUpgraded(address beacon)')
            || declText.startsWith('event Upgraded(address implementation)')) beaconUpgradable++
        break
      case 'function':
      case 'error':
        args = fmtInputs(decl.inputs)
        console.log(`${decl.type} ${decl.name}(${args}) ${decl.stateMutability || ''}`)
        break
      default:
        console.log(`${decl.type} UNKNOWN`)
    }
  }
  if (beaconUpgradable >= 2) console.log(`# contract appears to be a proxy`)
}

main()
