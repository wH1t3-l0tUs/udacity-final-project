import jwt from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import Axios from 'axios'
const logger = createLogger('auth')

const jwksUrl = 'https://dev-rico.eu.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  logger.info('verifying token', authHeader.substring(0, 20))
  const token = getToken(authHeader)
  const jwtDecoded = jwt.decode(token, { complete: true })

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys
  const signingKeys = keys.find((key) => key.kid === jwtDecoded.header.kid)
  logger.info('signingKeys', signingKeys)
  if (!signingKeys) {
    throw new Error('The JWKS endpoint did not contain any keys')
  }
  // ger pem data
  const pemData = signingKeys.x5c[0]
  // convert pem data to cert
  const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`
  // verify token
  const verifiedToken = jwt.verify(token, cert, {
    algorithms: ['RS256']
  })
  logger.info('verifiedToken', verifiedToken)
  return verifiedToken
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
