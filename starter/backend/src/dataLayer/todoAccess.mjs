import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import AWSXRay from 'aws-xray-sdk-core'

import { createLogger } from '../utils/logger.mjs'
import { AttachmentUtils } from '../fileStorage/attatchmentUtils.mjs'

const logger = createLogger('TodosAccess')
const attachment = new AttachmentUtils()

export class TodosAccess {
  constructor() {
    this.docClient = AWSXRay.captureAWSv3Client(new DynamoDB())
    this.todosTable = process.env.TODOS_TABLE
    this.todosIndex = process.env.INDEX_NAME
    this.dynamoDbClient = DynamoDBDocument.from(this.docClient)
    this.s3Client = new S3Client()
  }

  async getAllTodos(userId) {
    logger.info('Get all todos')
    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    return result.Items
  }

  async createTodo(todoItem) {
    logger.info('Create todo')

    const result = await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todoItem
    })
    logger.info('Created todo', result)
    return todoItem
  }

  async updateTodo(todoId, userId, todoUpdate) {
    logger.info('Update todo')
    const result = await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #name= :name, dueDate= :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    })
    return result.Attributes
  }

  async deleteTodo(userId, todoId) {
    logger.info('Delete todo')
    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })

    return todoId
  }

  async updateTodoAttachmentUrl(userId, todoId) {
    logger.info('Updating todo attachment url')
    const s3AttachmentUrl = attachment.getAttachmentUrl(todoId)
    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': s3AttachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
    await this.dynamoDbClient.update(params)
  }
}
