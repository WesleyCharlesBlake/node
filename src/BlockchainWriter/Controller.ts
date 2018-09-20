import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Exchange } from 'Messaging/Messages'
import { Messaging } from 'Messaging/Messaging'

import { getData } from './Bitcoin'
import { ControllerConfiguration } from './ControllerConfiguration'
import { DAO } from './DAO'

@injectable()
export class Controller {
  private readonly logger: Pino.Logger
  private readonly dao: DAO
  private readonly messaging: Messaging
  private readonly bitcoinCore: BitcoinCore
  private readonly configuration: ControllerConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DAO') dao: DAO,
    @inject('Messaging') messaging: Messaging,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('ClaimControllerConfiguration') configuration: ControllerConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.bitcoinCore = bitcoinCore
    this.configuration = configuration
    this.dao = dao
  }

  async requestTimestamp(ipfsDirectoryHash: string): Promise<void> {
    this.logger.debug({
      method: 'timestampWithRetry',
      ipfsDirectoryHash,
    })
    await this.dao.insertIpfsDirectoryHash(ipfsDirectoryHash)
  }

  async anchorNextIPFSDirectoryHash() {
    const logger = this.logger.child({ method: 'anchorNextHash' })

    logger.trace('Retrieving Next Hash To Anchor')

    const entry = await this.dao.findTransactionlessEntry()
    const ipfsDirectoryHash = entry && entry.ipfsDirectoryHash

    this.logger.trace({ ipfsDirectoryHash }, 'Next IPFS Directory Hash To Anchor Retrieved')

    if (!ipfsDirectoryHash) return

    try {
      await this.anchorIPFSDirectoryHash(ipfsDirectoryHash)
    } catch (exception) {
      logger.warn(
        {
          ipfsDirectoryHash,
          exception,
        },
        'Unexpected Exception While Anchoring IPFS Directory Hash'
      )
    }
  }

  private async anchorIPFSDirectoryHash(ipfsDirectoryHash: string): Promise<void> {
    const { configuration, dao, messaging, anchorData } = this
    const logger = this.logger.child({ method: 'anchorIPFSDirectoryHash' })

    logger.debug({ ipfsDirectoryHash }, 'Anchoring IPFS Hash')

    const ipfsDirectoryHashToBitcoinData = getData(configuration.poetNetwork, configuration.poetVersion)

    const data = ipfsDirectoryHashToBitcoinData(ipfsDirectoryHash)
    const txId = await anchorData(data)

    await dao.setTransactionId(ipfsDirectoryHash, txId)

    await messaging.publish(Exchange.IPFSHashTxId, {
      ipfsDirectoryHash,
      txId,
    })
  }

  private anchorData = async (data: string) => {
    const { bitcoinCore } = this
    const logger = this.logger.child({ method: 'anchorData' })

    const rawTransaction = await bitcoinCore.createRawTransaction([], { data })

    logger.trace(
      {
        rawTransaction,
      },
      'Got rawTransaction from Bitcoin Core'
    )

    const fundedTransaction = await bitcoinCore.fundRawTransaction(rawTransaction)

    logger.trace(
      {
        fundedTransaction,
      },
      'Got fundedTransaction from Bitcoin Core'
    )

    const signedTransaction = await bitcoinCore.signRawTransaction(fundedTransaction.hex)

    logger.trace(
      {
        signedTransaction,
      },
      'Got signedTransaction from Bitcoin Core'
    )

    const sentTransaction = await bitcoinCore.sendRawTransaction(signedTransaction.hex)

    logger.trace(
      {
        sentTransaction,
      },
      'Got sentTransaction from Bitcoin Core'
    )

    return sentTransaction
  }
}
