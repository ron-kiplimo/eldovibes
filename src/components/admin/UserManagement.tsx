import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Shield, Ban, CheckCircle, UserCheck, UserX, Heart, HeartOff, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLogActivity } from '@/hooks/useAdmin';

interface UserProfile {
  id: string;
  full_name: string;
  user_role: string;
  is_admin: boolean;
  is_banned: boolean;
  is_active: boolean;
  created_at: string;
  location: string;
  phone: string;
  escort_profile?: {
    id: string;
    stage_name: string;
    is_active: boolean;
    verified: boolean;
  };
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          user_role,
          is_admin,
          is_banned,
          is_active,
          created_at,
          location,
          phone
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }

      const { data: profilesData, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      // Fetch escort profiles separately
      const { data: escortData, error: escortError } = await supabase
        .from('escort_profiles')
        .select('id, user_id, stage_name, is_active, verified');

      if (escortError) throw escortError;

      // Combine the data
      const usersWithEscortProfiles = profilesData?.map(user => {
        const escortProfile = escortData?.find(escort => escort.user_id === user.id);
        return {
          ...user,
          escort_profile: escortProfile ? {
            id: escortProfile.id,
            stage_name: escortProfile.stage_name,
            is_active: escortProfile.is_active ?? true,
            verified: escortProfile.verified ?? false
          } : undefined
        };
      }) || [];

      return usersWithEscortProfiles as UserProfile[];
    }
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, newStatus: !isAdmin };
    },
    onSuccess: ({ userId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logActivity.mutate({
        action_type: 'user_update',
        target_type: 'user',
        target_id: userId,
        description: `${newStatus ? 'Granted' : 'Revoked'} admin privileges for user`,
      });
      toast({
        title: 'Success',
        description: `User admin status ${newStatus ? 'granted' : 'revoked'} successfully`
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update user admin status',
        variant: 'destructive'
      });
    }
  });

  const toggleBanMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: string; isBanned: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !isBanned })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, newStatus: !isBanned };
    },
    onSuccess: ({ userId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logActivity.mutate({
        action_type: 'user_moderation',
        target_type: 'user',
        target_id: userId,
        description: `${newStatus ? 'Banned' : 'Unbanned'} user account`,
      });
      toast({
        title: 'Success',
        description: `User ${newStatus ? 'banned' : 'unbanned'} successfully`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user ban status',
        variant: 'destructive'
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, newStatus: !isActive };
    },
    onSuccess: ({ userId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logActivity.mutate({
        action_type: 'user_update',
        target_type: 'user',
        target_id: userId,
        description: `${newStatus ? 'Activated' : 'Deactivated'} user account`,
      });
      toast({
        title: 'Success',
        description: `User account ${newStatus ? 'activated' : 'deactivated'} successfully`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user activation status',
        variant: 'destructive'
      });
    }
  });

  const adminActivateEscortMutation = useMutation({
    mutationFn: async ({ escortId, verified }: { escortId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('escort_profiles')
        .update({ verified: !verified, is_active: !verified })
        .eq('id', escortId);
      
      if (error) throw error;
      return { escortId, newStatus: !verified };
    },
    onSuccess: ({ escortId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      logActivity.mutate({
        action_type: 'escort_admin_override',
        target_type: 'escort_profile',
        target_id: escortId,
        description: `Admin ${newStatus ? 'activated' : 'deactivated'} escort profile without payment`,
      });
      toast({
        title: 'Success',
        description: `Escort profile ${newStatus ? 'activated' : 'deactivated'} by admin override`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update escort profile status',
        variant: 'destructive'
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          User Management
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {users?.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{user.full_name || 'No name'}</h3>
                      
                      {user.is_admin && (
                        <Badge variant="destructive">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      
                      <Badge variant="outline">{user.user_role}</Badge>
                      
                      {user.is_banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                      
                      {!user.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      
                      {user.escort_profile && (
                        <Badge variant="outline">
                          <Heart className="w-3 h-3 mr-1" />
                          Escort {user.escort_profile.verified ? '(Verified)' : '(Draft)'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Location: {user.location || 'Not specified'}</p>
                      <p>Phone: {user.phone || 'Not provided'}</p>
                      <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                      {user.escort_profile && (
                        <p>Escort Stage Name: {user.escort_profile.stage_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2">
                      <Button
                        variant={user.is_banned ? "default" : "destructive"}
                        size="sm"
                        onClick={() => toggleBanMutation.mutate({ userId: user.id, isBanned: user.is_banned })}
                        disabled={toggleBanMutation.isPending}
                      >
                        {user.is_banned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ userId: user.id, isActive: user.is_active })}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={user.is_admin ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAdminMutation.mutate({ userId: user.id, isAdmin: user.is_admin })}
                        disabled={toggleAdminMutation.isPending}
                      >
                        {user.is_admin ? (
                          <>
                            <Crown className="w-4 h-4 mr-1" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-1" />
                            Grant Admin
                          </>
                        )}
                      </Button>
                      
                      {user.escort_profile && (
                        <Button
                          variant={user.escort_profile.verified ? "destructive" : "default"}
                          size="sm"
                          onClick={() => adminActivateEscortMutation.mutate({ 
                            escortId: user.escort_profile!.id, 
                            verified: user.escort_profile!.verified 
                          })}
                          disabled={adminActivateEscortMutation.isPending}
                        >
                          {user.escort_profile.verified ? (
                            <>
                              <HeartOff className="w-4 h-4 mr-1" />
                              Hide Profile
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 mr-1" />
                              Activate Profile
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
