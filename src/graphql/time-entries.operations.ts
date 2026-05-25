import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  TimeEntry,
  TimeEntryConnection,
} from "@/types/time-entries.types";

export type { TimeEntry, TimeEntryConnection };

const TE_FIELDS = `id userId projectId description startTime endTime durationSeconds billable clockifyEntryId tags { id name } createdAt updatedAt`;

export const TIME_ENTRIES_QUERY: TypedDocumentNode<
  { timeEntries: TimeEntryConnection },
  {
    projectId?: number;
    projectIds?: number[];
    start?: string;
    end?: string;
    pagination?: { limit?: number; cursor?: number };
  }
> = gql`
  query TimeEntries($projectId: Int, $projectIds: [Int!], $start: DateTime, $end: DateTime, $pagination: PaginationInput) {
    timeEntries(projectId: $projectId, projectIds: $projectIds, start: $start, end: $end, pagination: $pagination) {
      items { ${TE_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const ACTIVE_TIMER_QUERY: TypedDocumentNode<
  { activeTimer: TimeEntry | null },
  Record<string, never>
> = gql`
  query ActiveTimer {
    activeTimer { ${TE_FIELDS} }
  }
`;

export const CREATE_TIME_ENTRY_MUTATION: TypedDocumentNode<
  { createTimeEntry: TimeEntry },
  {
    input: {
      projectId?: number;
      description?: string;
      startTime: string;
      endTime: string;
      billable?: boolean;
      clockifyEntryId?: string;
      tagIds?: number[];
    };
  }
> = gql`
  mutation CreateTimeEntry($input: CreateTimeEntryInput!) {
    createTimeEntry(input: $input) { ${TE_FIELDS} }
  }
`;

export const START_TIMER_MUTATION: TypedDocumentNode<
  { startTimer: TimeEntry },
  {
    input: {
      projectId?: number;
      description?: string;
      billable?: boolean;
      tagIds?: number[];
    };
  }
> = gql`
  mutation StartTimer($input: StartTimerInput!) {
    startTimer(input: $input) { ${TE_FIELDS} }
  }
`;

export const STOP_TIMER_MUTATION: TypedDocumentNode<
  { stopTimer: TimeEntry },
  Record<string, never>
> = gql`
  mutation StopTimer {
    stopTimer { ${TE_FIELDS} }
  }
`;

export const UPDATE_TIME_ENTRY_MUTATION: TypedDocumentNode<
  { updateTimeEntry: TimeEntry },
  {
    input: {
      id: number;
      projectId?: number | null;
      description?: string;
      startTime?: string;
      endTime?: string;
      billable?: boolean;
      tagIds?: number[];
    };
  }
> = gql`
  mutation UpdateTimeEntry($input: UpdateTimeEntryInput!) {
    updateTimeEntry(input: $input) { ${TE_FIELDS} }
  }
`;

export const DELETE_TIME_ENTRY_MUTATION: TypedDocumentNode<
  { deleteTimeEntry: boolean },
  { id: number }
> = gql`
  mutation DeleteTimeEntry($id: Int!) {
    deleteTimeEntry(id: $id)
  }
`;

export const TIMER_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  { timerUpdated: TimeEntry | null },
  { userId: number }
> = gql`
  subscription TimerUpdated($userId: Int!) {
    timerUpdated(userId: $userId) { ${TE_FIELDS} }
  }
`;
