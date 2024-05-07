import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createAttachmentUrl } from '../../businessLogic/todos.mjs'
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
    createLogger('--- generateUploadUrlHandler ---')
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    const url = await createAttachmentUrl(userId, todoId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  })
