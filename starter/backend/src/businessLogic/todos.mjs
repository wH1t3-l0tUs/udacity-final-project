import { TodosAccess } from '../dataLayer/todoAccess.mjs'
import { AttachmentUtils } from '../fileStorage/attatchmentUtils.mjs'
import { createLogger } from '../utils/logger.mjs'
import * as uuid from 'uuid'

// TODO: Implement BusinessLogic
const logger = createLogger('BusinessLogic')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function getTodosForUser(userId) {
  logger.info('Get todos')
  return todosAccess.getAllTodos(userId)
}

export async function createTodo(newTodo, userId) {
  logger.info('Create todo')
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUtils: s3AttachmentUrl,
    ...newTodo
  }
  return await todosAccess.createTodo(newItem)
}

export async function updateTodo(todoId, userId, updateTodoRequest) {
  logger.info('Update todos')
  return await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
}

export async function deleteTodo(userId, todoId) {
  logger.info('Delete todo')
  return todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentUrl(userId, todoId) {
  logger.info('Create attachment', userId, todoId)
  await todosAccess.updateTodoAttachmentUrl(userId, todoId)
  return attachmentUtils.getUploadUrl(todoId)
}
