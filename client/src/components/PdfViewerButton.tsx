import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerButtonProps {
  pdf_url: string;
  button_text?: string;
  scale?: number;
  className?: string;
}

export function PdfViewerButton({ 
  pdf_url, 
  button_text = "View PDF", 
  scale = 1.0,
  className = "" 
}: PdfViewerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentScale, setCurrentScale] = useState(scale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF loading error:', error);
    setLoading(false);
    setError('Failed to load PDF. This might be due to CORS restrictions.');
  }, []);

  const openInNewTab = useCallback(() => {
    window.open(pdf_url, '_blank', 'noopener,noreferrer');
  }, [pdf_url]);

  const downloadPdf = useCallback(() => {
    const link = document.createElement('a');
    link.href = pdf_url;
    link.download = pdf_url.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdf_url]);

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
    setIsOpen(true);
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setCurrentScale(scale);
  }, [scale]);

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
  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      {/* PDF Viewer Button */}
      <Button
        onClick={handleOpen}
        className={`
          bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800
          text-white border-0 rounded-2xl px-6 py-3 font-medium transition-all duration-300
          hover:scale-105 hover:shadow-lg active:scale-95
          ${className}
        `}
        data-testid="button-pdf-viewer"
      >
        <i className="fas fa-file-pdf mr-2"></i>
        {button_text}
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
                  file={pdf_url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  error={null}
                  className="max-w-full"
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