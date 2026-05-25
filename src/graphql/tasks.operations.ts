import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  TaskStatus,
  Subtask,
  TaskComment,
  Task,
  TaskDetail,
  TaskConnection,
} from "@/types/tasks.types";

export type {
  TaskStatus,
  Subtask,
  TaskComment,
  Task,
  TaskDetail,
  TaskConnection,
};

const TASK_FIELDS = `id projectId assigneeId title description status dueDate sortOrder createdAt updatedAt`;

export const TASKS_QUERY: TypedDocumentNode<
  { tasks: TaskConnection },
  { projectId: number; pagination?: { limit?: number; cursor?: number } }
> = gql`
  query Tasks($projectId: Int!, $pagination: PaginationInput) {
    tasks(projectId: $projectId, pagination: $pagination) {
      items { ${TASK_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const MY_TASKS_QUERY: TypedDocumentNode<
  { myTasks: TaskConnection },
  { pagination?: { limit?: number; cursor?: number } }
> = gql`
  query MyTasks($pagination: PaginationInput) {
    myTasks(pagination: $pagination) {
      items { ${TASK_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const CREATE_TASK_MUTATION: TypedDocumentNode<
  { createTask: Task },
  {
    input: {
      projectId: number;
      title: string;
      description?: string;
      assigneeId?: number;
      status?: TaskStatus;
      dueDate?: string;
    };
  }
> = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) { ${TASK_FIELDS} }
  }
`;

export const UPDATE_TASK_MUTATION: TypedDocumentNode<
  { updateTask: Task },
  {
    input: {
      id: number;
      title?: string;
      description?: string;
      status?: TaskStatus;
      sortOrder?: number;
      dueDate?: string;
      assigneeId?: number;
      projectId?: number;
    };
  }
> = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) { ${TASK_FIELDS} }
  }
`;

export const DELETE_TASK_MUTATION: TypedDocumentNode<
  { deleteTask: boolean },
  { id: number }
> = gql`
  mutation DeleteTask($id: Int!) {
    deleteTask(id: $id)
  }
`;

export const TASK_QUERY: TypedDocumentNode<
  { task: TaskDetail },
  { id: number }
> = gql`
  query Task($id: Int!) {
    task(id: $id) {
      ${TASK_FIELDS}
      subtasks { id taskId title done createdAt updatedAt }
      comments { id taskId authorId body createdAt updatedAt }
    }
  }
`;

export const CREATE_SUBTASK_MUTATION: TypedDocumentNode<
  { createSubtask: Subtask },
  { input: { taskId: number; title: string } }
> = gql`
  mutation CreateSubtask($input: CreateSubtaskInput!) {
    createSubtask(input: $input) {
      id
      taskId
      title
      done
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUBTASK_MUTATION: TypedDocumentNode<
  { updateSubtask: Subtask },
  { input: { id: number; title?: string; done?: boolean } }
> = gql`
  mutation UpdateSubtask($input: UpdateSubtaskInput!) {
    updateSubtask(input: $input) {
      id
      taskId
      title
      done
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SUBTASK_MUTATION: TypedDocumentNode<
  { deleteSubtask: boolean },
  { id: number }
> = gql`
  mutation DeleteSubtask($id: Int!) {
    deleteSubtask(id: $id)
  }
`;

export const CREATE_COMMENT_MUTATION: TypedDocumentNode<
  { createTaskComment: TaskComment },
  { input: { taskId: number; body: string } }
> = gql`
  mutation CreateTaskComment($input: CreateCommentInput!) {
    createTaskComment(input: $input) {
      id
      taskId
      authorId
      body
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMMENT_MUTATION: TypedDocumentNode<
  { updateTaskComment: TaskComment },
  { input: { id: number; body: string } }
> = gql`
  mutation UpdateTaskComment($input: UpdateCommentInput!) {
    updateTaskComment(input: $input) {
      id
      taskId
      authorId
      body
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_COMMENT_MUTATION: TypedDocumentNode<
  { deleteTaskComment: boolean },
  { id: number }
> = gql`
  mutation DeleteTaskComment($id: Int!) {
    deleteTaskComment(id: $id)
  }
`;
