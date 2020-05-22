import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('Data layer')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.TODOS_INDEX ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('1. Getting all todos') // winston

    const query = {
      TableName: this.todosTable,
      ScanIndexForward: false,
      IndexName: this.todoIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
    }

    logger.info('2. The query', query)

    const result = await this.docClient.query(query).promise()
    const items = result.Items

    logger.info('3. Query result', result)

    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {

    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    logger.info('Delete', params)

    await this.docClient.delete(params).promise()
  }

  async updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<void> {
    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set #todoName = :todoName, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ':todoName': updateTodoRequest.name,
        ':dueDate': updateTodoRequest.dueDate,
        ':done': updateTodoRequest.done
      },
      // I'm using ExpressionAttributeNames in this case to get over a 'Attribute name is a reserved keyword' error
      ExpressionAttributeNames: {
        "#todoName": "name"
      }
    }

    logger.info('Update', params)

    await this.docClient.update(params, (e, d) => {
      logger.info('e ', e)
      logger.info('d ', d)
    }).promise()

  }

}


