

// ── Types ──────────────────────────────────────────────────────────────────

import api from "./api";

export type TicketCategory =
  | 'INVITE' | 'ACCOUNT' | 'ORGANIZATION' | 'BILLING'
  | 'TECHNICAL' | 'DATA' | 'FEATURE_REQUEST' | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus =
  | 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';

export interface TicketReply {
  id:          string;
  message:     string;
  attachments: string[];
  isAdminReply: boolean;
  senderName:  string;
  senderEmail: string;
  createdAt:   string;
}

export interface Ticket {
  id:           string;
  ticketNumber: string;
  email:        string;
  name:         string;
  category:     TicketCategory;
  subject:      string;
  description:  string;
  priority:     TicketPriority;
  status:       TicketStatus;
  attachments:  string[];
  internalNote: string | null;
  resolvedAt:   string | null;
  createdAt:    string;
  updatedAt:    string;
  replies:      TicketReply[];
  assignedTo?:  { id: string; name: string; email: string } | null;
}

export interface CreateTicketPayload {
  email:          string;
  name:           string;
  category:       TicketCategory;
  subject:        string;
  description:    string;
  priority?:      TicketPriority;
  userId?:        string;
  organizationId?: string;
  meta?:          Record<string, string>;
}

export interface ListTicketsParams {
  status?:   TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  search?:   string;
  page?:     number;
  limit?:    number;
}

export interface PaginatedTickets {
  items:      Ticket[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface AdminStats {
  counts:     { total: number; open: number; inProgress: number; waiting: number; resolved: number; closed: number };
  byCategory: Record<TicketCategory, number>;
  byPriority: Record<TicketPriority, number>;
  recentOpen: Pick<Ticket, 'id' | 'ticketNumber' | 'subject' | 'priority' | 'createdAt' | 'email' | 'name'>[];
}

// ── API calls ──────────────────────────────────────────────────────────────

export const ticketApi = {
  // PUBLIC
  create: (payload: CreateTicketPayload) =>
    api.post<{ message: string; ticketNumber: string; ticketId: string; status: TicketStatus }>(
      '/support/tickets', payload
    ).then(r => r.data),

  track: (ticketNumber: string, email: string) =>
    api.get<Ticket>(`/support/tickets/track`, { params: { ticket: ticketNumber, email } })
      .then(r => r.data),

  // AUTH USER
  mine: (page = 1, limit = 10) =>
    api.get<PaginatedTickets>('/support/tickets/mine', { params: { page, limit } })
      .then(r => r.data),

  userReply: (ticketId: string, message: string) =>
    api.post<{ message: string; replyId: string }>(`/support/tickets/${ticketId}/reply`, { message })
      .then(r => r.data),

  // ADMIN
  adminStats: () =>
    api.get<AdminStats>('/support/tickets/admin/stats').then(r => r.data),

  adminList: (params: ListTicketsParams) =>
    api.get<PaginatedTickets>('/support/tickets/admin', { params }).then(r => r.data),

  adminGet: (id: string) =>
    api.get<Ticket>(`/support/tickets/admin/${id}`).then(r => r.data),

  adminReply: (id: string, message: string) =>
    api.post<{ message: string; replyId: string }>(`/support/tickets/admin/${id}/reply`, { message })
      .then(r => r.data),

  adminUpdate: (id: string, payload: { status?: TicketStatus; priority?: TicketPriority; internalNote?: string; assignedToId?: string }) =>
    api.patch<Ticket>(`/support/tickets/admin/${id}`, payload).then(r => r.data),
};

// ── Display helpers ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  INVITE:          'Invite Issue',
  ACCOUNT:         'Account / Login',
  ORGANIZATION:    'Organization',
  BILLING:         'Billing',
  TECHNICAL:       'Technical / Bug',
  DATA:            'Data Issue',
  FEATURE_REQUEST: 'Feature Request',
  OTHER:           'Other',
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW:    'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH:   'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-violet-100 text-violet-700',
  WAITING:     'bg-amber-100 text-amber-700',
  RESOLVED:    'bg-green-100 text-green-700',
  CLOSED:      'bg-slate-100 text-slate-500',
};