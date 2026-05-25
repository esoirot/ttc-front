import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";

export type ProjectStatus =
  | "DRAFT"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED"
  | "INVOICE_SENT"
  | "INVOICE_PAID";

export interface Project {
  id: number;
  userId: number | null;
  clientId: number | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  sourceLanguage: string | null;
  targetLanguage: string | null;
  wordCount: number | null;
  unitPrice: number | null;
  currency: string;
  deadline: string | null;
  startDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConnection {
  items: Project[];
  nextCursor: number | null;
  total: number;
}

const PROJECT_FIELDS = `
  id userId clientId title description status
  sourceLanguage targetLanguage wordCount unitPrice currency
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
  clientId?: number;
  status?: ProjectStatus;
  sourceLanguage?: string;
  targetLanguage?: string;
  wordCount?: number;
  unitPrice?: number;
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
