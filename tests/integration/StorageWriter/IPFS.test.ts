import { describe } from 'riteway'
import fetch from 'node-fetch'

import { IPFS } from '../../../src/StorageWriter/IPFS'
import { normalClaim, invalidUtf8CharactersClaim, encodeContent, decodeContent, cleanContent } from './claimData'

const IPFS_URL = process.env.IPFS_URL || 'http://localhost:5001'

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
    let claimFromIPFS
    
    try {
      const hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } finally {
      assert({
        given: 'a normal claim',
        actual: claimFromIPFS,
        expected: claim
      })
    }
  }

  {
    const ipfs = createIPFS()
    const claim = cleanContent(invalidUtf8CharactersClaim)
    let claimFromIPFS
    
    try {
      const hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } finally {
      assert({
        given: 'a claim that had its invalid characters stripped',
        actual: claimFromIPFS,
        expected: claim
      })
    }
  }

  {
    const ipfs = createIPFS()
    const claim = invalidUtf8CharactersClaim
    let claimFromIPFS
  
    try {
      const hash = await ipfs.addText(JSON.stringify(encodeContent(claim)))
      claimFromIPFS = decodeContent(JSON.parse(await fetchFile(hash)))
    } finally {
      assert({
        given: 'a claim that had its invalid characters encoded',
        actual: claimFromIPFS,
        expected: claim
      })
    }
  }
  
  {
    const ipfs = createIPFS()
    const claim = invalidUtf8CharactersClaim
    let claimFromIPFS

    try {
      const hash = await ipfs.addText(JSON.stringify(claim))
      claimFromIPFS = JSON.parse(await fetchFile(hash))
    } finally {
      assert({
        given: 'a claim with invalid characters',
        actual: claimFromIPFS,
        expected: claim
      })
    }
  }
})

