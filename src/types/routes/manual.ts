import type { ManualChunks } from '../../generated/prisma/client.js';

export interface UploadManualPayload {
  equipment_type_id: number;
  title: string;
  manufacturer: string;
  version: string;
  file_path: string;
}

export interface ManualChunksPayload {
  chunks: ManualChunks[];
}
export interface ManualSearchQuery {
  query: string;
  limit?: number;
}

export interface ChunkSearchResult {
  chunk_id: number;
  page_number: number | null;
  chunk_index: number;
  chunk_text: string;
  relevance_score: number;
}
