import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";

export type UserRole = "ADMIN" | "MANAGER" | "USER";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: string;
}

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    name
    role
    twoFactorEnabled
    createdAt
  }
`;

export const USERS_QUERY: TypedDocumentNode<
  { users: User[] },
  Record<string, never>
> = gql`
  ${USER_FIELDS}
  query Users {
    users {
      ...UserFields
    }
  }
`;

export interface Member {
  id: number;
  name: string | null;
  email: string;
}

export const MEMBERS_QUERY: TypedDocumentNode<
  { members: Member[] },
  Record<string, never>
> = gql`
  query Members {
    members {
      id
      name
      email
    }
  }
`;

export const UPDATE_USER_MUTATION: TypedDocumentNode<
  { updateUser: Pick<User, "id" | "role"> },
  {
    updateUserInput: {
      id: number;
      role?: UserRole;
      name?: string;
      email?: string;
    };
  }
> = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      role
    }
  }
`;

export const DELETE_USER_MUTATION: TypedDocumentNode<
  { removeUser: { id: number } },
  { id: number }
> = gql`
  mutation RemoveUser($id: Int!) {
    removeUser(id: $id) {
      id
    }
  }
`;
