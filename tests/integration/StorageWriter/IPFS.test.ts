import { describe } from 'riteway'
import { is } from 'ramda'
import fetch from 'node-fetch'

import { IPFS } from '../../../src/StorageWriter/IPFS'
import { offendingClaim, workingClaim, offendingClaimWithInvlaidUtf8CharsRemoved } from './claimData'

const isString = is(String)

const IPFS_URL = 'http://localhost:5001'

const createIPFS = ({
  ipfsUrl = IPFS_URL
} = {}) => {
  return new IPFS({
    ipfsUrl
  })
}

const fetchFile = async (hash: string): Promise<string> => {
  const response = await fetch(`${IPFS_URL}/api/v0/cat?arg=${hash}`)
  return response.text()
}

describe('IPFS.addText', async should => {
  const { assert } = should('')

  {
    const ipfs = createIPFS()
    const claim = workingClaim
    const hash = await ipfs.addText(JSON.stringify(claim))
    assert({
      given: 'a working claim',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    const file = await fetchFile(hash)
    assert({
      given: 'the working claims hash',
      should: 'read the same claim from ipfs',
      actual: JSON.parse(file),
      expected: claim
    })
  }

  {
    const ipfs = createIPFS()
    const claim = offendingClaimWithInvlaidUtf8CharsRemoved
    const hash = await ipfs.addText(JSON.stringify(claim))
    assert({
      given: 'a offending claim with invalid utf8 characters stripped',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    console.log('sdfdsfsdf', hash)

    const file = await fetchFile(hash)
    assert({
      given: 'the offending claim with invalid utf8 characters stripped hash',
      should: 'read the same claim from ipfs',
      actual: JSON.parse(file),
      expected: claim
    })
  }
  
  {
    const ipfs = createIPFS()
    const claim = offendingClaim
    const hash = await ipfs.addText(JSON.stringify(claim))
    assert({
      given: 'a offending claim',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    const file = await fetchFile(hash)
    assert({
      given: 'the offending claims hash',
      should: 'read the same claim from ipfs',
      actual: JSON.parse(file),
      expected: claim
    })
  }
})

