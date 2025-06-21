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

  let abi
  try {
    abi = JSON.parse(fs.readFileSync(`${CACHE_DIR}/named/${target[0]}`))
  } catch (e) {
    console.log(`Can't open ${target[0]}`)
    process.exit(1)
  }
  for (const decl of abi) {
    let args = ''
    switch (decl.type) {
      case 'constructor':
        break
      case 'function':
      case 'event':
      case 'error':
        //if (decl.type == 'error') console.log(decl)
        args = fmtInputs(decl.inputs)
        console.log(`${decl.type} ${decl.name}(${args}) ${decl.stateMutability || ''}`)
        break
      default:
        console.log(`${decl.type} UNKNOWN`)
    }
  }
}

main()
