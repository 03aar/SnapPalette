export interface ColorToken {
  hex: string;
  role: 'background' | 'primary' | 'secondary' | 'accent' | 'text' | 'neutral';
  usage: number; // 0 to 1
  name?: string;
}

export interface TypeStyle {
  id: string;
  label: string; // e.g. "H1", "Body"
  fontFamilyGuess: string;
  fontSizePx: number;
  fontWeight: number;
  lineHeightPx: number;
  letterSpacingPx: number;
}

export interface SpacingData {
  rawDistances: number[];
  scale: number[];
  baseUnit: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  colors: {
    primary: ColorToken[];
    extended: ColorToken[];
  };
  typography: TypeStyle[];
  spacing: SpacingData;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  currentResult: AnalysisResult | null;
  history: AnalysisResult[];
  errorMsg?: string;
}
