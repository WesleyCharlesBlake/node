import BitcoinCore = require('bitcoin-core')
import { inject, injectable } from 'inversify'
import { Collection, Db } from 'mongodb'
import * as Pino from 'pino'

import { Block, GetBlockVerbosity } from 'Helpers/Bitcoin'
import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { blockToPoetAnchors, getMatchingAnchors } from './Bitcoin'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'

@injectable()
export class ClaimController {
  private readonly logger: Pino.Logger
  private readonly db: Db
  private readonly collection: Collection
  private readonly messaging: Messaging
  private readonly bitcoinCore: BitcoinCore
  private readonly configuration: ClaimControllerConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('DB') db: Db,
    @inject('Messaging') messaging: Messaging,
    @inject('BitcoinCore') bitcoinCore: BitcoinCore,
    @inject('ClaimControllerConfiguration') configuration: ClaimControllerConfiguration
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.db = db
    this.messaging = messaging
    this.bitcoinCore = bitcoinCore
    this.configuration = configuration
    this.collection = this.db.collection('blockchainReader')
  }

  async scanBlock(blockHeight: number): Promise<void> {
    const logger = this.logger.child({ method: 'scanBlock' })

    logger.debug({ blockHeight }, 'Retrieving Block Hash')

    const blockHash = await this.bitcoinCore.getBlockHash(blockHeight)

    logger.trace(
      {
        blockHeight,
        blockHash,
      },
      'Block Hash retrieved successfully. Retrieving Raw Block'
    )

    const block: Block = await this.bitcoinCore.getBlock(blockHash, GetBlockVerbosity.Transactions)

    const poetAnchors = blockToPoetAnchors(block)

    const matchingPoetTimestamps = getMatchingAnchors(
      poetAnchors,
      this.configuration.poetNetwork,
      this.configuration.poetVersion
    )

    const unmatchingPoetTimestamps = poetAnchors.filter(_ => !matchingPoetTimestamps.includes(_))

    logger.trace(
      {
        blockHeight,
        blockHash,
        matchingPoetTimestamps,
        unmatchingPoetTimestamps,
      },
      'Block retrieved and scanned successfully'
    )

    await this.collection.updateOne(
      { blockHeight },
      {
        $set: {
          blockHash,
          matchingPoetTimestamps,
          unmatchingPoetTimestamps,
        },
      },
      { upsert: true }
    )

    if (matchingPoetTimestamps.length) await this.messaging.publishPoetTimestampsDownloaded(matchingPoetTimestamps)
  }

  async findHighestBlockHeight(): Promise<number | null> {
    const logger = this.logger.child({ method: 'findHighestBlockHeight' })

    const queryResults = await this.collection
      .find({}, { projection: { blockHeight: true, _id: 0 } })
      .sort({ blockHeight: -1 })
      .limit(1)
      .toArray()
    const highestBlockHeight = (queryResults && !!queryResults.length && queryResults[0].blockHeight) || null

    logger.info({ highestBlockHeight }, 'Retrieved Height of Highest Block Scanned So Far')

    return highestBlockHeight
  }

}
