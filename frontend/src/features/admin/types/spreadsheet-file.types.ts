// Types for Spreadsheet File Management
export interface UploadedFile {
  id: number;
  fileName: string;
  originalFileName: string;
  serviceName: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy?: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file?: UploadedFile;
}

export interface ServiceFilesGroup {
  [serviceName: string]: UploadedFile[];
}

export const SERVICE_NAMES = [
  "Freight Forwarding",
  "Chartering & Broking",
  "Ship Management",
  "Port Operations",
  "Customs Clearance",
  "Warehousing"
] as const;

export type ServiceName = typeof SERVICE_NAMES[number];
