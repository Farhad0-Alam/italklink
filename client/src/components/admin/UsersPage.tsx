import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Filter
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  sn: number;
  name: string;
  initials: string;
  email: string;
  registrationDate: string;
  planValidity: string;
  status: 'active' | 'inactive';
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states for adding user
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('free');
  
  const queryClient = useQueryClient();

  // Fetch users data
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users', search, statusFilter, planFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planFilter !== 'all') params.append('plan', planFilter);
      
      const url = `/api/admin/users${params.toString() ? '?' + params.toString() : ''}`;
      return fetch(url, { credentials: 'include' }).then(res => res.json());
    },
    initialData: []
  });

  const handleVisitUser = (userId: string) => {
    // TODO: Implement visit user functionality
    console.log('Visit user:', userId);
  };

  const handleEditUser = (userId: string) => {
    // TODO: Implement edit user functionality
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement delete user functionality
    console.log('Delete user:', userId);
  };

  const handleCopyUser = (userId: string) => {
    // TODO: Implement copy user functionality
    console.log('Copy user:', userId);
  };

  const handleAddUser = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        planId: plan
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPlan('free');
        setAddUserOpen(false);
        
        // Refresh users list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        
        console.log('User added successfully');
      } else {
        const error = await response.json();
        alert(`Failed to add user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Users ({users.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage platform users and their accounts
          </p>
        </div>
        
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with basic information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-[80px]">#SN.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Plan Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-gray-500">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">#{user.sn}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.registrationDate}</TableCell>
                    <TableCell className="text-gray-600">{user.planValidity}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVisitUser(user.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Visit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          className="p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyUser(user.id)}
                          className="p-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {users.length > 0 ? '1' : '0'}-{users.length} of {users.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}