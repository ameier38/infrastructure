import * as auth0 from '@pulumi/auth0'
import * as config from '../config'
import { gateway } from '../gateway'

export const connection = new auth0.Connection(config.env, {
    strategy: 'auth0',
    // NB: you must include the pulumi client id in order to create users
    enabledClients: [config.auth0Config.clientId, gateway.clientId]
}, { provider: config.auth0Provider })
