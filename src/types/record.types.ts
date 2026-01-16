export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    records: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PublicRecordResponse {
  title: string;
  description: string;
  category: string;
  createdAt: Date;
}

export interface PrivateRecordResponse {
  title: string;
  description: string;
  category: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminRecordResponse extends PrivateRecordResponse {
  visibility: "private";
}
