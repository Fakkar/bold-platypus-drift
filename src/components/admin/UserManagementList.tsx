"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, User, KeyRound } from 'lucide-react'; // Import KeyRound icon for reset password
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toPersianNumber } from '@/utils/format';
import { useSession } from '@/context/SessionContext'; // Import useSession to get the current user's session

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'viewer';
}

interface AppUser {
  id: string;
  email: string;
  created_at: string;
  profile: UserProfile | null;
}

const UserManagementList: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSession(); // Get the current session
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    // Using the RPC function to get all users with their roles
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) {
      console.error('Error fetching users:', error);
      toast.error(t('failed_to_load_users', { message: error.message }));
    } else {
      // Map the RPC result to the AppUser structure
      const formattedUsers: AppUser[] = data.map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        profile: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.avatar_url,
          role: user.role,
        },
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error(t('failed_to_update_user_role', { message: error.message }));
    } else {
      toast.success(t('user_role_updated_successfully'));
      fetchUsers(); // Re-fetch to update the list
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (!session) {
      toast.error(t('unauthorized_action'));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userIdToReset: userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      toast.success(t('password_reset_link_sent', { email: userEmail }));
    } catch (error: any) {
      console.error('Error resetting user password via Edge Function:', error);
      toast.error(t('failed_to_reset_password', { message: error.message }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!session) {
      toast.error(t('unauthorized_action'));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userIdToDelete: userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      toast.success(t('user_deleted_successfully'));
      fetchUsers(); // Re-fetch to update the list
    } catch (error: any) {
      console.error('Error deleting user via Edge Function:', error);
      toast.error(t('failed_to_delete_user', { message: error.message }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <p>{t('Loading users...')}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('manage_users')}</h3>

      {users.length === 0 ? (
        <p>{t('no_users_found')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('created_at')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((appUser) => (
                <TableRow key={appUser.id}>
                  <TableCell className="font-medium" dir="ltr">{appUser.email}</TableCell>
                  <TableCell>
                    <Select value={appUser.profile?.role || 'viewer'} onValueChange={(value: UserProfile['role']) => handleRoleChange(appUser.id, value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t('select_role')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('role_admin')}</SelectItem>
                        <SelectItem value="editor">{t('role_editor')}</SelectItem>
                        <SelectItem value="viewer">{t('role_viewer')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{formatDate(appUser.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleResetPassword(appUser.id, appUser.email)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('are_you_absolutely_sure')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('this_action_cannot_be_undone_user')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(appUser.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UserManagementList;