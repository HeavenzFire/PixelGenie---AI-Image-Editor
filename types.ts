
export interface EditHistoryItem {
  id: string;
  originalImage: string;
  editedImage: string;
  prompt: string;
  timestamp: number;
}

export interface ImageProcessingState {
  isProcessing: boolean;
  error: string | null;
}
