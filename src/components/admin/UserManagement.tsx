import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSession } from '@/context/SessionContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session) return;
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('get-all-users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) {
        toast.error(`Failed to load users: ${error.message}`);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [session]);

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {/* Edit/Delete buttons will be added here */}
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