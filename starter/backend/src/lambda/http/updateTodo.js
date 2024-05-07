import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateTodo } from '../../businessLogic/todos.mjs'
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
    createLogger('--- updateTodoHandler ---')
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo"
    const userId = getUserId(event)
    const todoItem = await updateTodo(userId, todoId, updatedTodo)
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: todoItem
      })
    }
  })
