import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) {
      toast.error(`Failed to load users: ${error.message}`);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error(`Failed to update role: ${error.message}`);
    } else {
      toast.success('User role updated successfully!');
      fetchUsers(); // Refresh the list
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        برای دعوت کاربر جدید، از بخش Authentication در داشبورد Supabase استفاده کنید.
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ایمیل</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead className="text-right">تغییر نقش</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium" dir="ltr">{user.email}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.email !== 'rahasahamrah@gmail.com' && (
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value: 'admin' | 'editor') => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="تغییر نقش" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;