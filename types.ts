
export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: { name: string; value: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  chart?: ChartData;
  isLoading?: boolean;
}

export interface CsvData {
  headers: string[];
  rows: string[][];
}
