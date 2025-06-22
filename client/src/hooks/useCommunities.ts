import { useState, useEffect } from 'react';
import { localDB, Community as DBCommunity } from '../lib/localStorageDB';
import { useAuth } from '../contexts/AuthContext';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  is_private: boolean;
  cover_image: string | null;
  location: string | null;
  member_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
    verified: boolean;
  };
  isJoined?: boolean;
  userRole?: string;
}

export const useCommunities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dbCommunities = localDB.getCommunities();
      const users = localDB.getUsers();
      
      const communitiesWithUsers: Community[] = dbCommunities.map(community => {
        const creator = users.find(u => u.id === community.created_by);
        
        return {
          ...community,
          users: {
            id: creator?.id || '',
            name: creator?.name || 'Bilinmeyen Kullanıcı',
            username: creator?.username || 'unknown',
            avatar_url: creator?.avatar_url || null,
            verified: creator?.verified || false
          },
          isJoined: false, // TODO: Implement community memberships
          userRole: undefined
        };
      });
      
      setCommunities(communitiesWithUsers);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (communityData: {
    name: string;
    description: string;
    category: string;
    is_private?: boolean;
    location?: string;
  }) => {
    if (!user) return { data: null, error: { message: 'Giriş yapmanız gerekli' } };

    try {
      const newCommunity = localDB.createCommunity({
        name: communityData.name,
        description: communityData.description,
        category: communityData.category,
        is_private: communityData.is_private || false,
        cover_image: null,
        location: communityData.location || null,
        created_by: user.id
      });

      // Yeni topluluğu listeye ekle
      const communityWithUser: Community = {
        ...newCommunity,
        users: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar_url: user.avatar_url || null,
          verified: user.verified
        },
        isJoined: true,
        userRole: 'admin'
      };

      setCommunities(prev => [communityWithUser, ...prev]);
      return { data: communityWithUser, error: null };
    } catch (err: any) {
      console.error('Error creating community:', err);
      return { data: null, error: { message: err.message } };
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) return { data: null, error: { message: 'Giriş yapmanız gerekli' } };

    try {
      // TODO: Implement actual community membership logic
      setCommunities(prev => prev.map(community => 
        community.id === communityId 
          ? { 
              ...community, 
              isJoined: true,
              member_count: community.member_count + 1
            }
          : community
      ));

      return { data: { success: true }, error: null };
    } catch (err: any) {
      console.error('Error joining community:', err);
      return { data: null, error: { message: err.message } };
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  return {
    communities,
    loading,
    error,
    createCommunity,
    joinCommunity,
    refetch: fetchCommunities
  };
};