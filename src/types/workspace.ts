export interface Folder {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  folder_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  notebook_id: string;
  filename: string;
  file_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  storage_url: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  notebook_id: string;
  name: string;
  normalized_name: string;
  description: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  notebook_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  image_urls?: string[];
  created_at: string;
}

export interface Citation {
  source_id: string;
  filename: string;
  content_snippet: string;
}

export interface ArtefactQuiz {
  id: string;
  title: string;
  questions?: {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }[];
  created_at?: string;
  updated_at?: string;
}

export interface ArtefactFlashcardItem {
  front: string;
  back: string;
  status?: 'review_again' | null;
}

export interface ArtefactFlashcard {
  id: string;
  notebook_id: string;
  items: ArtefactFlashcardItem[];
  title?: string;
  current_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ArtefactSummary {
  id: string;
  title?: string;
  content: string;
  audio_status?: 'pending' | 'processing' | 'completed' | 'error';
  audio_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ArtefactPodcast {
  id: string;
  notebook_id?: string;
  title?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  transcript: string | null;
  audio_url: string | null;
  created_at?: string;
  updated_at?: string;
}

// Pagination types
export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
