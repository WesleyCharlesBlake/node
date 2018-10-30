import { inject, injectable } from 'inversify'
import * as Pino from 'pino'

import { childWithFileName } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { Controller } from './Controller'
import { ExchangeConfiguration } from './ExchangeConfiguration'

@injectable()
export class Router {
  private readonly logger: Pino.Logger
  private readonly messaging: Messaging
  private readonly claimController: Controller
  private readonly exchange: ExchangeConfiguration

  constructor(
    @inject('Logger') logger: Pino.Logger,
    @inject('Messaging') messaging: Messaging,
    @inject('Controller') claimController: Controller,
    @inject('ExchangeConfiguration') exchange: ExchangeConfiguration,
  ) {
    this.logger = childWithFileName(logger, __filename)
    this.messaging = messaging
    this.claimController = claimController
    this.exchange = exchange
  }

  async start() {
    await this.messaging.consume(this.exchange.batchWriterCreateNextBatchSuccess, this.onCreateBatchSuccess)
  }

  onCreateBatchSuccess = async (message: any): Promise<void> => {
    const logger = this.logger.child({ method: 'onCreateBatchSuccess' })

    const messageContent = message.content.toString()
    const { ipfsDirectoryHash } = JSON.parse(messageContent)

    logger.trace(
      {
        ipfsDirectoryHash,
      },
      'Creating anchor request',
    )

    try {
      await this.claimController.requestAnchor(ipfsDirectoryHash)
      logger.trace({ ipfsDirectoryHash }, 'Anchor request created')
    } catch (error) {
      logger.error(
        {
          error,
          ipfsDirectoryHash,
        },
        'Anchor request failure',
      )
    }
  }
}
