import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { Tag } from "@/types/tags.types";

export type { Tag };

export const TAGS_QUERY: TypedDocumentNode<
  { tags: Tag[] },
  Record<string, never>
> = gql`
  query Tags {
    tags {
      id
      name
    }
  }
`;

export const CREATE_TAG_MUTATION: TypedDocumentNode<
  { createTag: Tag },
  { input: { name: string } }
> = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_TAG_MUTATION: TypedDocumentNode<
  { deleteTag: boolean },
  { id: number }
> = gql`
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id)
  }
`;
