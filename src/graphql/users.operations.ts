import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  UserRole,
  User,
  Member,
  AdminPermission,
} from "@/types/users.types";

export type { UserRole, User, Member, AdminPermission };

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    name
    role
    twoFactorEnabled
    adminPermissions
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
  { updateUser: Pick<User, "id" | "role" | "adminPermissions"> },
  {
    updateUserInput: {
      id: number;
      role?: UserRole;
      name?: string;
      email?: string;
      adminPermissions?: AdminPermission[];
    };
  }
> = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      role
      adminPermissions
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
