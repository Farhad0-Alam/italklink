import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BusinessCard } from '@shared/schema';

interface Page {
  id: string;
  key: string;
  path: string;
  label: string;
  visible: boolean;
  elements: any[];
}

interface PagesSidebarProps {
  pages: Page[];
  currentPageId: string;
  onPageChange: (pageId: string) => void;
  onPagesUpdate: (pages: Page[]) => void;
}

export function PagesSidebar({ pages, currentPageId, onPageChange, onPagesUpdate }: PagesSidebarProps) {
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageLabel, setNewPageLabel] = useState('');
  const [newPagePath, setNewPagePath] = useState('');

  const addNewPage = () => {
    if (!newPageLabel.trim()) return;
    
    const newPage: Page = {
      id: `page-${Date.now()}`,
      key: `page-${Date.now()}`,
      path: newPagePath.trim() || newPageLabel.toLowerCase().replace(/\s+/g, '-'),
      label: newPageLabel.trim(),
      visible: true,
      elements: []
    };

    onPagesUpdate([...pages, newPage]);
    setNewPageLabel('');
    setNewPagePath('');
    setIsAddingPage(false);
  };

  const deletePage = (pageId: string) => {
    const updatedPages = pages.filter(p => p.id !== pageId);
    onPagesUpdate(updatedPages);
    
    // If current page was deleted, switch to home
    if (currentPageId === pageId) {
      const homePage = updatedPages.find(p => p.key === 'home') || updatedPages[0];
      if (homePage) {
        onPageChange(homePage.id);
      }
    }
  };

  const getPageIcon = (page: Page) => {
    if (page.key === 'home') return 'fa-home';
    return 'fa-file-alt';
  };

  const getPageColor = (page: Page) => {
    if (page.id === currentPageId) return 'text-orange-500 border-orange-500 bg-orange-50';
    return 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 p-4 space-y-4">
      {/* Pages Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="fas fa-sitemap text-gray-500"></i>
          <h3 className="text-sm font-medium text-gray-700">Pages</h3>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {pages.length}
          </span>
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`flex items-center justify-between p-2 rounded border-l-4 cursor-pointer transition-colors ${getPageColor(page)}`}
            onClick={() => onPageChange(page.id)}
          >
            <div className="flex items-center space-x-2">
              <i className={`fas ${getPageIcon(page)} text-sm`}></i>
              <div>
                <div className="text-sm font-medium">
                  {page.label}
                  {page.key === 'home' && (
                    <span className="text-xs text-gray-400 ml-1">(Default)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Delete button for non-home pages */}
            {page.key !== 'home' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
              >
                <i className="fas fa-trash text-xs"></i>
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add New Page Button */}
      <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
            data-testid="button-add-new-page"
          >
            <i className="fas fa-plus mr-2"></i>
            Add New Page
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Name
              </label>
              <Input
                placeholder="e.g., About, Services, Contact"
                value={newPageLabel}
                onChange={(e) => setNewPageLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addNewPage();
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Path <span className="text-gray-400 text-sm">(optional)</span>
              </label>
              <Input
                placeholder="e.g., about, services, contact"
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to auto-generate from page name
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingPage(false);
                  setNewPageLabel('');
                  setNewPagePath('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={addNewPage}
                disabled={!newPageLabel.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <div className="flex items-start space-x-2">
          <i className="fas fa-info-circle text-blue-500 mt-0.5 text-sm"></i>
          <div className="text-xs text-blue-700">
            <strong>Multi-Page Cards:</strong> Additional pages will only show the Page Elements section for editing. The home page contains all card information.
          </div>
        </div>
      </div>
    </div>
  );
}