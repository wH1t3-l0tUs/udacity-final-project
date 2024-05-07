import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    createLogger('--- deleteTodoHandler ---')
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event)
    await deleteTodo(userId, todoId)
    return {
      statusCode: 204,
      body: ''
    }
  })

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
