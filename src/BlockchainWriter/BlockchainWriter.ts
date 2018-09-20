import BitcoinCore = require('bitcoin-core')
import { injectable, Container } from 'inversify'
import { Db, MongoClient } from 'mongodb'
import * as Pino from 'pino'

import { createModuleLogger } from 'Helpers/Logging'
import { Messaging } from 'Messaging/Messaging'

import { BlockchainWriterConfiguration } from './BlockchainWriterConfiguration'
import { ClaimController } from './ClaimController'
import { ClaimControllerConfiguration } from './ClaimControllerConfiguration'
import { Router } from './Router'
import { Service } from './Service'
import { ServiceConfiguration } from './ServiceConfiguration'

@injectable()
export class BlockchainWriter {
  private readonly logger: Pino.Logger
  private readonly configuration: BlockchainWriterConfiguration

  constructor(configuration: BlockchainWriterConfiguration) {
    this.configuration = configuration
    this.logger = createModuleLogger(configuration, __dirname)
  }

  async start() {
    this.logger.info({ configuration: this.configuration }, 'BlockchainWriter Starting')

    const mongoClient = await MongoClient.connect(this.configuration.dbUrl)
    const dbConnection = await mongoClient.db()

    const container = createContainer(this.configuration, this.logger, dbConnection)

    const messaging = container.get('Messaging') as Messaging
    await messaging.start()

    const router = container.get('Router') as Router
    await router.start()

    const service = container.get('Service') as Service
    await service.start()

    // await this.createIndices()

    this.logger.info('BlockchainWriter Started')
  }

  // private async createIndices() {
  //   const collection = this.dbConnection.collection('blockchainWriter')
  //   await collection.createIndex({ ipfsDirectoryHash: 1 }, { unique: true })
  // }
}

const createContainer = (configuration: BlockchainWriterConfiguration, logger: Pino.Logger, dbConnection: Db) => {
  const container = new Container()

  container.bind<Router>('Router').to(Router)
  container.bind<ClaimController>('ClaimController').to(ClaimController)
  container.bind<Service>('Service').to(Service)

  container.bind<Pino.Logger>('Logger').toConstantValue(logger)
  container.bind<Db>('DB').toConstantValue(dbConnection)
  container.bind<Messaging>('Messaging').toConstantValue(new Messaging(configuration.rabbitmqUrl))
  container.bind<BitcoinCore>('BitcoinCore').toConstantValue(
    new BitcoinCore({
      host: this.configuration.bitcoinUrl,
      port: this.configuration.bitcoinPort,
      network: this.configuration.bitcoinNetwork,
      username: this.configuration.bitcoinUsername,
      password: this.configuration.bitcoinPassword,
    })
  )
  container.bind<ServiceConfiguration>('ServiceConfiguration').toConstantValue({
    timestampIntervalInSeconds: this.configuration.timestampIntervalInSeconds,
  })
  container.bind<ClaimControllerConfiguration>('ClaimControllerConfiguration').toConstantValue(this.configuration)

  return container
}
