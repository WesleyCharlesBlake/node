import { inject, injectable } from 'inversify'
import * as request from 'request'

import { IPFSConfiguration } from './IPFSConfiguration'

/**
 * Wrapper around IPFS' RPC
 */

@injectable()
export class IPFS {
  private readonly url: string

  constructor(@inject('IPFSConfiguration') configuration: IPFSConfiguration) {
    this.url = configuration.ipfsUrl
  }

  addText = (text: string): Promise<string> =>
    new Promise((resolve, reject) =>
      request.post(
        {
          url: `${this.url}/api/v0/add`,
          formData: { file: Buffer.from(text) },
        },
        (err: any, httpResponse: any, body: any) => (err ? reject('upload failed') : resolve(JSON.parse(body).Hash))
      )
    )
}
