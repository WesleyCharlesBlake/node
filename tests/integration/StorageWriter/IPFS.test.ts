import { describe } from 'riteway'
import { is } from 'ramda'
import fetch from 'node-fetch'

import { IPFS } from '../../../src/StorageWriter/IPFS'
import { normalClaim, invalidUtf8CharactersClaim, encodeContent, decodeContent, cleanContent } from './claimData'

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
    const claim = normalClaim
    let hash, claimFromIPFS
    
    try {
      hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } catch(e) { console.error(e) }

    assert({
      given: 'a normal claim',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    assert({
      given: 'the normal claim\'s hash',
      should: 'read the same claim from ipfs',
      actual: claimFromIPFS,
      expected: claim
    })
  }

  {
    const ipfs = createIPFS()
    const claim = cleanContent(invalidUtf8CharactersClaim)
    let hash, claimFromIPFS
    
    try {
      hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } catch(e) { console.error(e) }

    assert({
      given: 'a invalid utf8 characters are stripped',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    assert({
      given: 'the claim with invalid utf8 characters stripped hash',
      should: 'read the same claim from ipfs',
      actual: claimFromIPFS,
      expected: claim
    })
  }

  {
    const ipfs = createIPFS()
    const claim = encodeContent(invalidUtf8CharactersClaim)
    let hash, claimFromIPFS
  
    try {
      hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } catch(e) { console.error(e) }

    assert({
      given: 'a claim with invalid utf8 characters, utf8 encoded',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    assert({
      given: 'the offending claim content utf8 encoded hash',
      should: 'read the same claim from ipfs',
      actual: decodeContent(claimFromIPFS),
      expected: claim
    })
  }
  
  {
    const ipfs = createIPFS()
    const claim = invalidUtf8CharactersClaim
    let hash, claimFromIPFS

    try {
      hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } catch(e) { console.error(e) }
  
    assert({
      given: 'a claim with invalid utf8 characters',
      should: 'return a hash',
      actual: isString(hash),
      expected: true
    })

    assert({
      given: 'the a claim with invalid utf8 character\'s hash',
      should: 'read the same claim from ipfs',
      actual: claimFromIPFS,
      expected: claim
    })
  }
})

