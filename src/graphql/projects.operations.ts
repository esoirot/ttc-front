import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  Project,
  ProjectConnection,
  ProjectStatus,
} from "@/types/projects.types";

const PROJECT_FIELDS = `
  id userId clientId title description status
  sourceLanguage targetLanguage wordCount unitPrice fixedFee hourlyRate perWordRate currency
  deadline startDate createdAt updatedAt
`;

export const PROJECTS_QUERY: TypedDocumentNode<
  { projects: ProjectConnection },
  {
    status?: ProjectStatus;
    search?: string;
    pagination?: { limit?: number; cursor?: number };
  }
> = gql`
  query Projects($status: ProjectStatus, $search: String, $pagination: PaginationInput) {
    projects(status: $status, search: $search, pagination: $pagination) {
      items { ${PROJECT_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const PROJECT_QUERY: TypedDocumentNode<
  { project: Project | null },
  { id: number }
> = gql`
  query Project($id: Int!) {
    project(id: $id) { ${PROJECT_FIELDS} }
  }
`;

type ProjectInput = {
  title: string;
  description?: string;
  clientId?: number | null;
  status?: ProjectStatus;
  sourceLanguage?: string;
  targetLanguage?: string;
  wordCount?: number;
  unitPrice?: number;
  fixedFee?: number | null;
  hourlyRate?: number | null;
  perWordRate?: number | null;
  currency?: string;
  deadline?: string;
  startDate?: string;
};

export const CREATE_PROJECT_MUTATION: TypedDocumentNode<
  { createProject: Project },
  { input: ProjectInput }
> = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) { ${PROJECT_FIELDS} }
  }
`;

export const UPDATE_PROJECT_MUTATION: TypedDocumentNode<
  { updateProject: Project },
  { input: Partial<ProjectInput> & { id: number } }
> = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) { ${PROJECT_FIELDS} }
  }
`;

export const DELETE_PROJECT_MUTATION: TypedDocumentNode<
  { deleteProject: boolean },
  { id: number }
> = gql`
  mutation DeleteProject($id: Int!) {
    deleteProject(id: $id)
  }
`;
