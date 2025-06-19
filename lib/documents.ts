import { supabase, handleSupabaseError } from './supabase';
import { DatabaseResponse } from '@/types/database';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: DocumentCategory;
  created_at: string;
  updated_at?: string;
}

export enum DocumentCategory {
  INVESTMENT = 'investment',
  CONTRACT = 'contract',
  RECEIPT = 'receipt',
  REPORT = 'report',
  TAX = 'tax',
  OTHER = 'other'
}

export interface DocumentInsert {
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: DocumentCategory;
}

export class DocumentService {
  // Get user documents
  static async getUserDocuments(
    userId: string,
    category?: DocumentCategory
  ): Promise<DatabaseResponse<Document[]>> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Documents retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve documents'
      };
    }
  }

  // Get document by ID
  static async getDocumentById(
    userId: string,
    documentId: string
  ): Promise<DatabaseResponse<Document>> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Document retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve document'
      };
    }
  }

  // Add document
  static async addDocument(document: DocumentInsert): Promise<DatabaseResponse<Document>> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...document,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Document added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to add document'
      };
    }
  }

  // Delete document
  static async deleteDocument(
    userId: string,
    documentId: string
  ): Promise<DatabaseResponse<void>> {
    try {
      // First get the document to check if it exists and belongs to the user
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Delete the file from storage if it exists
      if (document?.file_url) {
        const filePath = document.file_url.split('/').pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath]);

          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // We don't throw here as the document record is already deleted
          }
        }
      }

      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to delete document'
      };
    }
  }

  // Generate download URL
  static async getDownloadUrl(
    userId: string,
    documentId: string
  ): Promise<DatabaseResponse<string>> {
    try {
      // First get the document to check if it exists and belongs to the user
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!document?.file_url) {
        return {
          success: false,
          error: 'Document file not found',
          message: 'The document does not have an associated file'
        };
      }

      // Extract the file path from the URL
      const filePath = document.file_url.split('/').pop();
      if (!filePath) {
        return {
          success: false,
          error: 'Invalid file path',
          message: 'The document has an invalid file path'
        };
      }

      // Generate a download URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (urlError) {
        throw urlError;
      }

      return {
        success: true,
        data: urlData.signedUrl,
        message: 'Download URL generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to generate download URL'
      };
    }
  }

  // Upload document file
  static async uploadDocumentFile(
    userId: string,
    file: File
  ): Promise<DatabaseResponse<{ path: string; url: string }>> {
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Upload the file
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      return {
        success: true,
        data: {
          path: data.path,
          url: urlData.publicUrl
        },
        message: 'File uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to upload file'
      };
    }
  }

  // Get document categories with counts
  static async getDocumentCategoryCounts(
    userId: string
  ): Promise<DatabaseResponse<Record<DocumentCategory, number>>> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('category')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Initialize counts for all categories
      const counts: Record<DocumentCategory, number> = {
        [DocumentCategory.INVESTMENT]: 0,
        [DocumentCategory.CONTRACT]: 0,
        [DocumentCategory.RECEIPT]: 0,
        [DocumentCategory.REPORT]: 0,
        [DocumentCategory.TAX]: 0,
        [DocumentCategory.OTHER]: 0
      };

      // Count documents by category
      data?.forEach(doc => {
        if (doc.category in counts) {
          counts[doc.category as DocumentCategory]++;
        }
      });

      return {
        success: true,
        data: counts,
        message: 'Document category counts retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve document category counts'
      };
    }
  }
}