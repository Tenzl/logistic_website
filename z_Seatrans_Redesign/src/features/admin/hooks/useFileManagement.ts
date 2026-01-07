import { useState, useCallback, useEffect } from 'react';
import { UploadedFile, FileUploadResponse, ServiceFilesGroup } from '../types/spreadsheet-file.types';

const API_BASE_URL = 'http://localhost:8080/api/spreadsheet-files';

export function useFileManagement() {
  const [files, setFiles] = useState<ServiceFilesGroup>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all files grouped by service
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data: ServiceFilesGroup = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch files for a specific service
  const fetchFilesByService = useCallback(async (serviceName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/service/${encodeURIComponent(serviceName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data: UploadedFile[] = await response.json();
      setFiles(prev => ({ ...prev, [serviceName]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload a file
  const uploadFile = useCallback(async (
    file: File,
    serviceName: string,
    uploadedBy: string = 'admin'
  ): Promise<FileUploadResponse> => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceName', serviceName);
    formData.append('uploadedBy', uploadedBy);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data: FileUploadResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload file');
      }

      // Refresh the files list after successful upload
      await fetchFilesByService(serviceName);
      
      setUploadProgress(100);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error uploading file:', err);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [fetchFilesByService]);

  // Delete a file
  const deleteFile = useCallback(async (fileId: number, serviceName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Refresh the files list after successful deletion
      await fetchFilesByService(serviceName);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting file:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFilesByService]);

  // Download a file
  const downloadFile = useCallback(async (fileId: number, fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error downloading file:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    loading,
    error,
    uploadProgress,
    uploadFile,
    deleteFile,
    downloadFile,
    refreshFiles: fetchFiles,
    fetchFilesByService,
  };
}
