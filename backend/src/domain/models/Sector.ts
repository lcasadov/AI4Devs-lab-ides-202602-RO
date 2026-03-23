export interface Sector {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSectorDto {
  name: string;
}

export interface UpdateSectorDto {
  name: string;
}
