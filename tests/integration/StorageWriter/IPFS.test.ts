import { describe } from 'riteway'
import fetch from 'node-fetch'

import { IPFS } from '../../../src/StorageWriter/IPFS'
import { normalClaim, invalidUtf8CharactersClaim, encodeContent, decodeContent, cleanContent } from './claimData'

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
  const { assert } = should('match the claim read from ipfs')

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
      given: 'a claim that had its invalid characters stripped',
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
      given: 'a claim that had its invalid characters encoded',
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
      given: 'the a claim with invalid characters',
      actual: claimFromIPFS,
      expected: claim
    })
  }
})

