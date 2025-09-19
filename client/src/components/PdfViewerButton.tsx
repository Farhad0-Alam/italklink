import { useState, useCallback, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker with better configuration for faster loading
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PdfViewerButtonProps {
  pdf_file: string;
  button_text?: string;
  scale?: number;
  className?: string;
  file_name?: string;
}

export function PdfViewerButton({ 
  pdf_file, 
  button_text = "View PDF", 
  scale = 1.0,
  className = "",
  file_name = "" 
}: PdfViewerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentScale, setCurrentScale] = useState(scale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Memoize and cache the PDF blob for better performance
  const pdfBlob = useMemo(() => {
    if (!pdf_file) return null;
    try {
      const base64Data = pdf_file.includes(',') ? pdf_file.split(',')[1] : pdf_file;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error creating PDF blob:', error);
      return null;
    }
  }, [pdf_file]);

  // Create blob URL when modal opens
  useEffect(() => {
    if (isOpen && pdfBlob && !blobUrl) {
      const url = window.URL.createObjectURL(pdfBlob);
      setBlobUrl(url);
      setLoading(true);
    }
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, pdfBlob]);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setPageNumber(1); // Reset to first page
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF loading error:', error);
    setLoading(false);
    setError('Failed to load PDF file. The file may be corrupted or invalid.');
  }, []);

  const openInNewTab = useCallback(() => {
    if (pdfBlob) {
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    }
  }, [pdfBlob]);

  const downloadPdf = useCallback(() => {
    if (pdfBlob) {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file_name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }, [pdf_file, file_name]);

  const handleZoomIn = useCallback(() => {
    setCurrentScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  }, [numPages]);

  const handleOpen = useCallback(() => {
    if (!pdf_file || !pdfBlob) return;
    setIsOpen(true);
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setCurrentScale(scale);
  }, [scale, pdf_file, pdfBlob]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setLoading(false);
    setError(null);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case 'ArrowLeft':
        goToPrevPage();
        break;
      case 'ArrowRight':
        goToNextPage();
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
    }
  }, [isOpen, handleClose, goToPrevPage, goToNextPage, handleZoomIn, handleZoomOut]);

  // Add keyboard event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* PDF Viewer Button - Wallet Style */}
      <Button
        onClick={handleOpen}
        variant="default"
        className={`
          h-12 px-6 text-base font-semibold
          bg-gradient-to-r from-purple-600 to-purple-700 
          hover:from-purple-700 hover:to-purple-800
          text-white border-0 shadow-lg hover:shadow-xl
          dark:from-purple-700 dark:to-purple-800 
          dark:hover:from-purple-800 dark:hover:to-purple-900
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95
          rounded-xl border-2 border-purple-500/20
          ring-2 ring-purple-500/10 hover:ring-purple-500/30
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
        disabled={!pdf_file}
        data-testid="button-pdf-viewer"
      >
        <i className="fas fa-file-pdf mr-3 text-purple-100" style={{fontSize: '18px'}}></i>
        <span className="text-white font-medium tracking-wide">{button_text}</span>
      </Button>

      {/* PDF Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-6xl max-h-[90vh] p-0 overflow-hidden rounded-2xl"
          onEscapeKeyDown={handleClose}
        >
          {/* Modal Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-purple-50 dark:bg-purple-900/20">
            <DialogTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              PDF Viewer
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={currentScale <= 0.5}
                  className="h-8 w-8 p-0"
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {Math.round(currentScale * 100)}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={currentScale >= 3}
                  className="h-8 w-8 p-0"
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Page Navigation */}
              {numPages && numPages > 1 && (
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="h-8 w-8 p-0"
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium min-w-[4rem] text-center">
                    {pageNumber} of {numPages}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="h-8 w-8 p-0"
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                className="h-8"
                data-testid="button-open-new-tab"
                disabled={!pdf_file}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPdf}
                className="h-8"
                data-testid="button-download-pdf"
                disabled={!pdf_file}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
                data-testid="button-close-modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12" data-testid="pdf-loading">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12" data-testid="pdf-error">
                <div className="text-red-500 text-center max-w-md">
                  <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                  <p className="text-lg font-medium mb-2">PDF Loading Failed</p>
                  <p className="text-sm mb-4">{error}</p>
                  <Button
                    onClick={openInNewTab}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-fallback-open"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open PDF in New Tab
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="flex flex-col items-center">
                <Document
                  file={blobUrl}
                  onLoadStart={() => setLoading(true)}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  error={null}
                  className="max-w-full"
                  options={{
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                    cMapPacked: true,
                    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={currentScale}
                    loading={null}
                    error={null}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg rounded-lg overflow-hidden"
                    data-testid={`pdf-page-${pageNumber}`}
                  />
                </Document>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}