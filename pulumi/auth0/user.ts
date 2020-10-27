import * as auth0 from '@pulumi/auth0'
import * as config from '../config'
import { connection } from './connection'

export const adminUser = new auth0.User('admin', {
    name: 'admin',
    email: config.auth0Config.adminEmail,
    emailVerified: true,
    connectionName: connection.name,
    password: config.auth0Config.adminPassword,
}, { provider: config.auth0Provider })
