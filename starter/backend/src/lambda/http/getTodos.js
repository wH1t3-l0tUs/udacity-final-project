import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getTodosForUser } from '../../businessLogic/todos.mjs'
import { getUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

// TODO: Get all TODO items for a current user
export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    createLogger('--- getTodosHandler ---')
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })
