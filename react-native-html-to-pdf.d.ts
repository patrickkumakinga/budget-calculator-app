declare module 'react-native-html-to-pdf' {
    export interface Options {
      html: string;
      fileName?: string;
      directory?: string;
      height?: string;
      width?: string;
      padding?: number;
    }
  
    export interface PDFResult {
      filePath: string;
    }
  
    export default class RNHTMLtoPDF {
      static convert(options: Options): Promise<PDFResult>;
    }
  }
  