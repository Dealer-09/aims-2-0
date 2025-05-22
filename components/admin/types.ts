// Shared types for admin components
export type Request = {
  id: string;
  email: string;
  status: string;
  requestedAt: string;
};

export type User = {
  id: string;
  email: string;
  role: string;
  class?: string;
  subject?: string;
};

export type PDF = {
  id: string;
  url: string;
  filename: string;
  class: string;
  subject: string;
};
