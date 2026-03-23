export interface Sector {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectorRequest {
  name: string;
}

export interface UpdateSectorRequest {
  name: string;
}
