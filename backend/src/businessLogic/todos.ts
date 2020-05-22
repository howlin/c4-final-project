import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const todoAccess = new TodoAccess()
const logger = createLogger('todoId')

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getAllTodos(userId)
}

export async function createTodo( 
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function deleteTodo(todoId: string, jwtToken: string): Promise<void> {
  logger.info('Business Logic Part: ', {
    todoId, 
    jwtToken
  })
  const userId = parseUserId(jwtToken)
  await todoAccess.deleteTodo(todoId, userId)
}

export async function updateTodo( 
  updateTodoRequest: UpdateTodoRequest, 
  todoId: string,
  jwtToken: string ): Promise<void> 
{
  const userId = parseUserId(jwtToken)
  await todoAccess.updateTodo(updateTodoRequest, userId, todoId)
}