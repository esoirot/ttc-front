import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  TaskStatus,
  Subtask,
  TaskComment,
  TaskLabel,
  Task,
  TaskDetail,
  TaskConnection,
} from "@/types/tasks.types";

const TASK_FIELDS = `id projectId assigneeId title description status dueDate startDate recurring reminderOffset sortOrder totalTimeSeconds createdAt updatedAt`;

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
      dueDate?: string | null;
      startDate?: string | null;
      recurring?: string | null;
      reminderOffset?: string | null;
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
      checklistTitles
      subtasks { id taskId checklistTitle title done dueDate createdAt updatedAt }
      comments { id taskId authorId body createdAt updatedAt }
      labels { id taskId name color createdAt }
      activities {
        id taskId userId type payload createdAt
        user { id name }
      }
      attachments { id taskId type fileName url displayText createdAt }
    }
  }
`;

export const CREATE_SUBTASK_MUTATION: TypedDocumentNode<
  { createSubtask: Subtask },
  {
    input: {
      taskId: number;
      checklistTitle?: string;
      title: string;
      dueDate?: string;
    };
  }
> = gql`
  mutation CreateSubtask($input: CreateSubtaskInput!) {
    createSubtask(input: $input) {
      id
      taskId
      checklistTitle
      title
      done
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUBTASK_MUTATION: TypedDocumentNode<
  { updateSubtask: Subtask },
  {
    input: {
      id: number;
      checklistTitle?: string;
      title?: string;
      done?: boolean;
      dueDate?: string | null;
    };
  }
> = gql`
  mutation UpdateSubtask($input: UpdateSubtaskInput!) {
    updateSubtask(input: $input) {
      id
      taskId
      checklistTitle
      title
      done
      dueDate
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

export const CREATE_CHECKLIST_MUTATION: TypedDocumentNode<
  { createChecklist: boolean },
  { taskId: number; title: string }
> = gql`
  mutation CreateChecklist($taskId: Int!, $title: String!) {
    createChecklist(taskId: $taskId, title: $title)
  }
`;

export const DELETE_CHECKLIST_MUTATION: TypedDocumentNode<
  { deleteChecklist: boolean },
  { taskId: number; title: string }
> = gql`
  mutation DeleteChecklist($taskId: Int!, $title: String!) {
    deleteChecklist(taskId: $taskId, title: $title)
  }
`;

export const RENAME_CHECKLIST_MUTATION: TypedDocumentNode<
  { renameChecklist: boolean },
  { taskId: number; oldTitle: string; newTitle: string }
> = gql`
  mutation RenameChecklist(
    $taskId: Int!
    $oldTitle: String!
    $newTitle: String!
  ) {
    renameChecklist(taskId: $taskId, oldTitle: $oldTitle, newTitle: $newTitle)
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

export const CREATE_TASK_LABEL_MUTATION: TypedDocumentNode<
  { createTaskLabel: TaskLabel },
  { input: { taskId: number; name: string; color?: string } }
> = gql`
  mutation CreateTaskLabel($input: CreateTaskLabelInput!) {
    createTaskLabel(input: $input) {
      id
      taskId
      name
      color
      createdAt
    }
  }
`;

export const DELETE_TASK_LABEL_MUTATION: TypedDocumentNode<
  { deleteTaskLabel: boolean },
  { id: number }
> = gql`
  mutation DeleteTaskLabel($id: Int!) {
    deleteTaskLabel(id: $id)
  }
`;
