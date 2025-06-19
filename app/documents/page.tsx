'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	FileText,
	Download,
	Search,
	Filter,
	Plus,
	Trash2,
	Eye,
	Calendar,
	FileUp,
	File,
	FileCog,
	FileCheck,
	FileWarning,
	FileX,
	FileQuestion,
	CheckCircle,
	AlertCircle,
	Loader2
} from 'lucide-react';
import { Document, DocumentCategory, DocumentService } from '@/lib/documents';

export default function DocumentsPage() {
	const { user } = useAuth();
	const [documents, setDocuments] = useState<Document[]>([]);
	const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
	const [categoryCounts, setCategoryCounts] = useState<Record<DocumentCategory, number>>({
		[DocumentCategory.INVESTMENT]: 0,
		[DocumentCategory.CONTRACT]: 0,
		[DocumentCategory.RECEIPT]: 0,
		[DocumentCategory.REPORT]: 0,
		[DocumentCategory.TAX]: 0,
		[DocumentCategory.OTHER]: 0
	});

	// Upload state
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [uploadTitle, setUploadTitle] = useState('');
	const [uploadDescription, setUploadDescription] = useState('');
	const [uploadCategory, setUploadCategory] = useState<DocumentCategory>(DocumentCategory.OTHER);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	// Download state
	const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
	const [downloadError, setDownloadError] = useState<string | null>(null);

	// Fetch documents
	const fetchDocuments = async () => {
		if (!user?.id) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const result = await DocumentService.getUserDocuments(user.id);

			if (result.success && result.data) {
				setDocuments(result.data);
				setFilteredDocuments(result.data);
			} else {
				setError(result.error || 'Failed to load documents');
			}

			// Get category counts
			const countsResult = await DocumentService.getDocumentCategoryCounts(user.id);
			if (countsResult.success && countsResult.data) {
				setCategoryCounts(countsResult.data);
			}
		} catch (err) {
			setError('An unexpected error occurred');
			console.error('Error fetching documents:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDocuments();
	}, [user?.id]);

	// Filter documents when search query or category changes
	useEffect(() => {
		if (!documents.length) {
			setFilteredDocuments([]);
			return;
		}

		let filtered = [...documents];

		// Apply category filter
		if (activeCategory !== 'all') {
			filtered = filtered.filter(doc => doc.category === activeCategory);
		}

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(doc =>
				doc.title.toLowerCase().includes(query) ||
				doc.description?.toLowerCase().includes(query) ||
				doc.file_type.toLowerCase().includes(query)
			);
		}

		setFilteredDocuments(filtered);
	}, [documents, searchQuery, activeCategory]);

	// Handle file upload
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setUploadFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!user?.id || !uploadFile) return;

		try {
			setIsUploading(true);
			setUploadError(null);

			// Upload file to storage
			const uploadResult = await DocumentService.uploadDocumentFile(user.id, uploadFile);

			if (!uploadResult.success) {
				throw new Error(uploadResult.error || 'Failed to upload file');
			}

			if (!uploadResult.data || !uploadResult.data.url)
				throw new Error('File upload succeeded but no URL was returned.');

			// Create document record
			const documentResult = await DocumentService.addDocument({
				user_id: user.id,
				title: uploadTitle || uploadFile.name,
				description: uploadDescription,
				file_url: uploadResult.data.url,
				file_type: uploadFile.type,
				file_size: uploadFile.size,
				category: uploadCategory
			});

			if (!documentResult.success) {
				throw new Error(documentResult.error || 'Failed to create document record');
			}

			setUploadSuccess(true);

			// Reset form and refresh documents
			setTimeout(() => {
				setUploadFile(null);
				setUploadTitle('');
				setUploadDescription('');
				setUploadCategory(DocumentCategory.OTHER);
				setUploadSuccess(false);
				setIsUploadDialogOpen(false);
				fetchDocuments();
			}, 2000);

		} catch (err) {
			console.error('Upload error:', err);
			setUploadError(err instanceof Error ? err.message : 'Failed to upload document');
		} finally {
			setIsUploading(false);
		}
	};

	// Handle document download
	const handleDownload = async (documentId: string) => {
		if (!user?.id) return;

		try {
			setIsDownloading(prev => ({ ...prev, [documentId]: true }));
			setDownloadError(null);

			const result = await DocumentService.getDownloadUrl(user.id, documentId);

			if (!result.success) {
				throw new Error(result.error || 'Failed to generate download URL');
			}

			// Open the download URL in a new tab
			window.open(result.data, '_blank');

		} catch (err) {
			console.error('Download error:', err);
			setDownloadError(err instanceof Error ? err.message : 'Failed to download document');
		} finally {
			setIsDownloading(prev => ({ ...prev, [documentId]: false }));
		}
	};

	// Handle document deletion
	const handleDelete = async (documentId: string) => {
		if (!user?.id) return;

		if (!confirm('Are you sure you want to delete this document?')) {
			return;
		}

		try {
			setLoading(true);

			const result = await DocumentService.deleteDocument(user.id, documentId);

			if (!result.success) {
				throw new Error(result.error || 'Failed to delete document');
			}

			// Refresh documents
			fetchDocuments();

		} catch (err) {
			console.error('Delete error:', err);
			setError(err instanceof Error ? err.message : 'Failed to delete document');
		} finally {
			setLoading(false);
		}
	};

	// Get icon for document category
	const getCategoryIcon = (category: DocumentCategory) => {
		switch (category) {
			case DocumentCategory.INVESTMENT:
				return FileCheck;
			case DocumentCategory.CONTRACT:
				return FileCog;
			case DocumentCategory.RECEIPT:
				return FileText;
			case DocumentCategory.REPORT:
				return FileWarning;
			case DocumentCategory.TAX:
				return FileX;
			case DocumentCategory.OTHER:
			default:
				return FileQuestion;
		}
	};

	// Format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Format date
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	// Get color for document category
	const getCategoryColor = (category: DocumentCategory): string => {
		switch (category) {
			case DocumentCategory.INVESTMENT:
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case DocumentCategory.CONTRACT:
				return 'bg-purple-100 text-purple-800 border-purple-200';
			case DocumentCategory.RECEIPT:
				return 'bg-green-100 text-green-800 border-green-200';
			case DocumentCategory.REPORT:
				return 'bg-orange-100 text-orange-800 border-orange-200';
			case DocumentCategory.TAX:
				return 'bg-red-100 text-red-800 border-red-200';
			case DocumentCategory.OTHER:
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	// Get icon for file type
	const getFileTypeIcon = (fileType: string) => {
		if (fileType.includes('pdf')) return FileText;
		if (fileType.includes('image')) return File;
		if (fileType.includes('word') || fileType.includes('document')) return FileText;
		if (fileType.includes('excel') || fileType.includes('spreadsheet')) return FileText;
		return File;
	};

	return (
		<div className="p-6" key={Date.now()}>
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-igudar-text">
							Documents
						</h1>
						<p className="text-lg text-igudar-text-secondary">
							Manage and access all your investment documents
						</p>
					</div>

					<Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
						<DialogTrigger asChild>
							<Button className="bg-igudar-primary hover:bg-igudar-primary/90 text-white">
								<Plus className="mr-2 h-4 w-4" />
								Upload Document
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Upload New Document</DialogTitle>
							</DialogHeader>

							<div className="space-y-4 py-4">
								{uploadSuccess ? (
									<div className="text-center py-4">
										<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
										<h3 className="text-lg font-semibold text-igudar-text mb-2">Upload Successful!</h3>
										<p className="text-igudar-text-secondary">
											Your document has been uploaded successfully.
										</p>
									</div>
								) : (
									<>
										{uploadError && (
											<Alert variant="destructive">
												<AlertDescription>{uploadError}</AlertDescription>
											</Alert>
										)}

										<div className="space-y-2">
											<Label htmlFor="file">Document File</Label>
											<Input
												id="file"
												type="file"
												onChange={handleFileChange}
												disabled={isUploading}
											/>
											{uploadFile && (
												<p className="text-xs text-igudar-text-muted">
													Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="title">Document Title</Label>
											<Input
												id="title"
												placeholder="Enter document title"
												value={uploadTitle}
												onChange={(e) => setUploadTitle(e.target.value)}
												disabled={isUploading}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="description">Description (Optional)</Label>
											<Input
												id="description"
												placeholder="Enter document description"
												value={uploadDescription}
												onChange={(e) => setUploadDescription(e.target.value)}
												disabled={isUploading}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="category">Category</Label>
											<Select
												value={uploadCategory}
												onValueChange={(value) => setUploadCategory(value as DocumentCategory)}
												disabled={isUploading}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={DocumentCategory.INVESTMENT}>Investment</SelectItem>
													<SelectItem value={DocumentCategory.CONTRACT}>Contract</SelectItem>
													<SelectItem value={DocumentCategory.RECEIPT}>Receipt</SelectItem>
													<SelectItem value={DocumentCategory.REPORT}>Report</SelectItem>
													<SelectItem value={DocumentCategory.TAX}>Tax Document</SelectItem>
													<SelectItem value={DocumentCategory.OTHER}>Other</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="pt-4">
											<Button
												onClick={handleUpload}
												disabled={!uploadFile || isUploading}
												className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white"
											>
												{isUploading ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Uploading...
													</>
												) : (
													<>
														<FileUp className="mr-2 h-4 w-4" />
														Upload Document
													</>
												)}
											</Button>
										</div>
									</>
								)}
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{/* Search and Filter */}
				<div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-igudar-text-muted" />
						<Input
							placeholder="Search documents by title, description, or file type..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					<Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as DocumentCategory | 'all')}>
						<SelectTrigger className="w-[180px]">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Filter by category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value={DocumentCategory.INVESTMENT}>Investment</SelectItem>
							<SelectItem value={DocumentCategory.CONTRACT}>Contract</SelectItem>
							<SelectItem value={DocumentCategory.RECEIPT}>Receipt</SelectItem>
							<SelectItem value={DocumentCategory.REPORT}>Report</SelectItem>
							<SelectItem value={DocumentCategory.TAX}>Tax Document</SelectItem>
							<SelectItem value={DocumentCategory.OTHER}>Other</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Error Message */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Download Error Message */}
				{downloadError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{downloadError}</AlertDescription>
					</Alert>
				)}

				{/* Document Categories */}
				<Tabs defaultValue="all" value={activeCategory} onValueChange={(value) => setActiveCategory(value as DocumentCategory | 'all')}>
					<TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
						<TabsTrigger value="all" className="text-xs md:text-sm">
							All
							<Badge className="ml-2 bg-gray-100 text-gray-800">{documents.length}</Badge>
						</TabsTrigger>
						<TabsTrigger value={DocumentCategory.INVESTMENT} className="text-xs md:text-sm">
							Investment
							<Badge className="ml-2 bg-blue-100 text-blue-800">{categoryCounts[DocumentCategory.INVESTMENT]}</Badge>
						</TabsTrigger>
						<TabsTrigger value={DocumentCategory.CONTRACT} className="text-xs md:text-sm">
							Contract
							<Badge className="ml-2 bg-purple-100 text-purple-800">{categoryCounts[DocumentCategory.CONTRACT]}</Badge>
						</TabsTrigger>
						<TabsTrigger value={DocumentCategory.RECEIPT} className="text-xs md:text-sm">
							Receipt
							<Badge className="ml-2 bg-green-100 text-green-800">{categoryCounts[DocumentCategory.RECEIPT]}</Badge>
						</TabsTrigger>
						<TabsTrigger value={DocumentCategory.REPORT} className="text-xs md:text-sm">
							Report
							<Badge className="ml-2 bg-orange-100 text-orange-800">{categoryCounts[DocumentCategory.REPORT]}</Badge>
						</TabsTrigger>
						<TabsTrigger value={DocumentCategory.TAX} className="text-xs md:text-sm">
							Tax
							<Badge className="ml-2 bg-red-100 text-red-800">{categoryCounts[DocumentCategory.TAX]}</Badge>
						</TabsTrigger>
						<TabsTrigger value={DocumentCategory.OTHER} className="text-xs md:text-sm">
							Other
							<Badge className="ml-2 bg-gray-100 text-gray-800">{categoryCounts[DocumentCategory.OTHER]}</Badge>
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* Documents List */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Your Documents</CardTitle>
								<CardDescription>
									{filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
									{searchQuery && ` matching "${searchQuery}"`}
									{activeCategory !== 'all' && ` in category "${activeCategory}"`}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{/* Loading State */}
						{loading && (
							<div className="space-y-4">
								{Array.from({ length: 5 }).map((_, index) => (
									<div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
										<Skeleton className="h-10 w-10 rounded-lg" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-1/3" />
											<Skeleton className="h-3 w-1/2" />
										</div>
										<Skeleton className="h-8 w-24" />
									</div>
								))}
							</div>
						)}

						{/* Empty State */}
						{!loading && filteredDocuments.length === 0 && (
							<div className="text-center py-12">
								<FileText className="h-16 w-16 text-igudar-primary/30 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-igudar-text mb-2">No Documents Found</h3>
								<p className="text-igudar-text-secondary mb-6 max-w-md mx-auto">
									{searchQuery || activeCategory !== 'all'
										? 'Try adjusting your search or filter criteria.'
										: 'You haven\'t uploaded any documents yet. Click the "Upload Document" button to get started.'}
								</p>
								{(searchQuery || activeCategory !== 'all') && (
									<Button
										variant="outline"
										onClick={() => {
											setSearchQuery('');
											setActiveCategory('all');
										}}
									>
										Clear Filters
									</Button>
								)}
							</div>
						)}

						{/* Documents List */}
						{!loading && filteredDocuments.length > 0 && (
							<div className="space-y-4">
								{filteredDocuments.map((document) => {
									const FileTypeIcon = getFileTypeIcon(document.file_type);
									const CategoryIcon = getCategoryIcon(document.category);

									return (
										<div key={document.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
											<div className="p-2 bg-igudar-primary/10 rounded-lg">
												<FileTypeIcon className="h-6 w-6 text-igudar-primary" />
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between">
													<div>
														<h4 className="font-medium text-igudar-text">{document.title}</h4>
														{document.description && (
															<p className="text-sm text-igudar-text-muted line-clamp-1">{document.description}</p>
														)}
													</div>
													<Badge className={`${getCategoryColor(document.category)} ml-2`}>
														<CategoryIcon className="mr-1 h-3 w-3" />
														{document.category.charAt(0).toUpperCase() + document.category.slice(1)}
													</Badge>
												</div>

												<div className="flex items-center justify-between mt-2">
													<div className="flex items-center text-xs text-igudar-text-muted space-x-4">
														<span>{formatFileSize(document.file_size)}</span>
														<div className="flex items-center">
															<Calendar className="mr-1 h-3 w-3" />
															<span>{formatDate(document.created_at)}</span>
														</div>
													</div>

													<div className="flex items-center space-x-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => window.open(document.file_url, '_blank')}
															className="text-igudar-text hover:text-igudar-primary"
														>
															<Eye className="h-3.5 w-3.5" />
														</Button>

														<Button
															variant="outline"
															size="sm"
															onClick={() => handleDownload(document.id)}
															disabled={isDownloading[document.id]}
															className="text-igudar-text hover:text-igudar-primary"
														>
															{isDownloading[document.id] ? (
																<Loader2 className="h-3.5 w-3.5 animate-spin" />
															) : (
																<Download className="h-3.5 w-3.5" />
															)}
														</Button>

														<Button
															variant="outline"
															size="sm"
															onClick={() => handleDelete(document.id)}
															className="text-red-500 hover:text-red-700 hover:bg-red-50"
														>
															<Trash2 className="h-3.5 w-3.5" />
														</Button>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Document Management Tips */}
				<Card>
					<CardHeader>
						<CardTitle>Document Management Tips</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-3">
							<div className="space-y-2">
								<h4 className="font-medium text-igudar-text">Organize by Category</h4>
								<p className="text-sm text-igudar-text-muted">
									Categorize your documents to easily find them later. Use the category filter to quickly access specific document types.
								</p>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-igudar-text">Regular Backups</h4>
								<p className="text-sm text-igudar-text-muted">
									We recommend downloading and backing up important investment documents regularly for your records.
								</p>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-igudar-text">Secure Storage</h4>
								<p className="text-sm text-igudar-text-muted">
									All documents are securely stored and encrypted. Only you can access your personal documents.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
