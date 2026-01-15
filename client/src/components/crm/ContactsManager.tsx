import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact, useContactActivities } from "../hooks/useCRM";
import { Contact, ContactCreateInput } from "../types";
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Mail, Phone, Building, Star, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export function ContactsManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // API hooks
  const { data: contactsResponse, isLoading: contactsLoading, error: contactsError, refetch } = useContacts({
    search: searchTerm,
    lifecycleStage: lifecycleFilter === "all" ? undefined : lifecycleFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const { data: contactActivities = [], isLoading: activitiesLoading } = useContactActivities(
    selectedContact?.id || ""
  );

  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact(selectedContact?.id || "");
  const deleteContactMutation = useDeleteContact();

  // Handle API response structure
  const contacts = contactsResponse?.contacts || [];
  const displayContacts = contacts;

  const getLifecycleStageColor = (stage: string) => {
    switch (stage) {
      case 'subscriber': return 'bg-gray-100 text-gray-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'marketing_qualified_lead': return 'bg-yellow-100 text-yellow-800';
      case 'sales_qualified_lead': return 'bg-orange-100 text-orange-800';
      case 'opportunity': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleCreateContact = (data: ContactCreateInput) => {
    createContactMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Contact created",
          description: "New contact has been added successfully.",
        });
        setShowCreateDialog(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error creating contact",
          description: error.message || "Failed to create contact.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteContact = (contactId: string) => {
    deleteContactMutation.mutate(contactId, {
      onSuccess: () => {
        toast({
          title: "Contact deleted",
          description: "Contact has been removed successfully.",
        });
        setSelectedContact(null);
      },
      onError: (error: any) => {
        toast({
          title: "Error deleting contact",
          description: error.message || "Failed to delete contact.",
          variant: "destructive",
        });
      },
    });
  };

  if (contactsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (contactsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-contacts-header">
              Contacts
            </h2>
            <p className="text-red-600 mt-1">Failed to load contacts. Please try again.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" data-testid="button-retry-contacts">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-contacts-header">
            Contacts ({displayContacts.length})
          </h2>
          <p className="text-gray-600 mt-1">Manage your contacts and leads</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-contact">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <ContactForm 
              onSubmit={handleCreateContact}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createContactMutation.isPending}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-contacts"
          />
        </div>
        
        <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
          <SelectTrigger className="w-48" data-testid="select-lifecycle-filter">
            <SelectValue placeholder="Lifecycle Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="subscriber">Subscriber</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="marketing_qualified_lead">Marketing Qualified</SelectItem>
            <SelectItem value="sales_qualified_lead">Sales Qualified</SelectItem>
            <SelectItem value="opportunity">Opportunity</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32" data-testid="select-priority-filter">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid gap-4">
            {displayContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(contact)}
                data-testid={`contact-card-${contact.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLeadScoreColor(contact.leadScore)}`}>
                            {contact.leadScore}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          {contact.company && (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {contact.title ? `${contact.title} at ${contact.company}` : contact.company}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getLifecycleStageColor(contact.lifecycleStage)}`}>
                            {contact.lifecycleStage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <Star className={`h-4 w-4 ${getPriorityColor(contact.priority)}`} />
                          {contact.lastContact && (
                            <span className="text-xs text-gray-400">
                              Last contact {formatDistanceToNow(new Date(contact.lastContact), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`button-contact-menu-${contact.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedContact(contact)}>
                          <User className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {contact.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <Card className="sticky top-6" data-testid="contact-detail-panel">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </CardTitle>
                    <CardDescription>
                      {selectedContact.title && selectedContact.company
                        ? `${selectedContact.title} at ${selectedContact.company}`
                        : selectedContact.company || selectedContact.email
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedContact.email}</span>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedContact.phone}</span>
                    </div>
                  )}
                  {selectedContact.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedContact.company}</span>
                    </div>
                  )}
                </div>

                {/* Lead Score and Stage */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lead Score</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLeadScoreColor(selectedContact.leadScore)}`}>
                      {selectedContact.leadScore}/100
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lifecycle Stage</span>
                    <Badge className={`text-xs ${getLifecycleStageColor(selectedContact.lifecycleStage)}`}>
                      {selectedContact.lifecycleStage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Priority</span>
                    <div className="flex items-center">
                      <Star className={`h-4 w-4 ${getPriorityColor(selectedContact.priority)} mr-1`} />
                      <span className="text-sm capitalize">{selectedContact.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedContact.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedContact.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedContact.notes && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">Notes</span>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedContact.notes}
                    </p>
                  </div>
                )}

                {/* Recent Activities */}
                <div>
                  <span className="text-sm font-medium mb-3 block">Recent Activities</span>
                  {activitiesLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : contactActivities.length > 0 ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {contactActivities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a contact to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Contact Form Component
interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: ContactCreateInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ContactForm({ contact, onSubmit, onCancel, isLoading }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactCreateInput>({
    firstName: contact?.firstName || "",
    lastName: contact?.lastName || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    title: contact?.title || "",
    lifecycleStage: contact?.lifecycleStage || "lead",
    priority: contact?.priority || "medium",
    tags: contact?.tags || [],
    notes: contact?.notes || "",
    socialLinks: contact?.socialLinks || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[600px]" data-testid="dialog-contact-form">
      <DialogHeader>
        <DialogTitle>
          {contact ? "Edit Contact" : "Add New Contact"}
        </DialogTitle>
        <DialogDescription>
          {contact ? "Update the contact information below." : "Create a new contact to add to your CRM."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              required
              data-testid="input-first-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Smith"
              required
              data-testid="input-last-name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.smith@example.com"
            required
            data-testid="input-email"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0123"
              data-testid="input-phone"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="TechCorp"
              data-testid="input-company"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Marketing Director"
            data-testid="input-title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lifecycleStage">Lifecycle Stage</Label>
            <Select value={formData.lifecycleStage} onValueChange={(value) => setFormData({ ...formData, lifecycleStage: value as any })}>
              <SelectTrigger data-testid="select-lifecycle-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscriber">Subscriber</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="marketing_qualified_lead">Marketing Qualified Lead</SelectItem>
                <SelectItem value="sales_qualified_lead">Sales Qualified Lead</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
              <SelectTrigger data-testid="select-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this contact..."
            rows={3}
            data-testid="textarea-notes"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-save-contact">
            {isLoading ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}