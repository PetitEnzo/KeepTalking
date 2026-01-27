import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../services/supabase';

interface WordContribution {
  contribution_id: string;
  word: string;
  difficulty: string;
  syllables: any[];
  status: string;
  created_at: string;
  image_url?: string;
  user_id: string;
  users?: {
    username: string;
  };
}

interface User {
  user_id: string;
  username: string;
  role: string;
  level: number;
  total_points: number;
  current_streak: number;
  created_at: string;
}

interface HandSign {
  key: string;
  image_url: string;
}

interface HandPosition {
  configuration_number: number;
  description: string;
  image_url: string;
}

export default function AdminScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contributions' | 'users'>('contributions');
  
  // Contributions
  const [contributions, setContributions] = useState<WordContribution[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Images
  const [handSigns, setHandSigns] = useState<HandSign[]>([]);
  const [handPositions, setHandPositions] = useState<HandPosition[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadImages();
      if (activeTab === 'contributions') {
        loadContributions();
      } else {
        loadUsers();
      }
    }
  }, [isAdmin, activeTab, filterStatus]);

  const loadImages = async () => {
    try {
      // Charger les configurations de main
      const { data: signsData } = await supabase
        .from('hand_signs')
        .select('configuration_number, consonnes, description, image_url')
        .order('configuration_number', { ascending: true });
      
      if (signsData) {
        // Mapper pour garder la compatibilité avec l'interface existante
        const mappedSigns = signsData.map((sign: any) => ({
          key: sign.consonnes.split(', ')[0],
          image_url: sign.image_url,
        }));
        setHandSigns(mappedSigns);
      }
      
      // Charger les positions du visage
      const { data: positionsData } = await supabase
        .from('hand_positions')
        .select('configuration_number, description, image_url')
        .order('configuration_number', { ascending: true });
      
      if (positionsData) {
        setHandPositions(positionsData);
      }
    } catch (error) {
      console.error('Erreur chargement images:', error);
    }
  };

  const checkAdminAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContributions = async () => {
    try {
      let query = supabase
        .from('word_contributions')
        .select(`
          *,
          users:user_id (username)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (!error && data) {
        setContributions(data);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const updateContributionStatus = async (
    contributionId: string,
    newStatus: 'approved' | 'rejected',
    contributorUserId: string
  ) => {
    try {
      const { data: adminData } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!adminData) return;

      const { error } = await supabase
        .from('word_contributions')
        .update({
          status: newStatus,
          reviewed_by: adminData.user_id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('contribution_id', contributionId);

      if (error) throw error;

      // If approved, grant XP to contributor
      if (newStatus === 'approved') {
        await supabase.rpc('add_experience', {
          p_user_id: contributorUserId,
          p_xp_amount: 50,
          p_source: 'word_contribution',
        });
      }

      Alert.alert(
        'Succès',
        `Mot ${newStatus === 'approved' ? 'approuvé' : 'rejeté'} !${
          newStatus === 'approved' ? ' +50 XP accordés au contributeur.' : ''
        }`
      );

      loadContributions();
    } catch (error: any) {
      console.error('Error updating contribution:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le statut');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'apprenant' | 'admin') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      Alert.alert('Succès', `Rôle mis à jour vers ${newRole}`);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le rôle');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!user || !isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthIcon}>🔒</Text>
          <Text style={styles.notAuthTitle}>Accès refusé</Text>
          <Text style={styles.notAuthText}>
            Cette page est réservée aux administrateurs
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>🛡️ Administration</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Gestion des contributions et des utilisateurs
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable
          style={[styles.tab, { borderBottomColor: colors.border }, activeTab === 'contributions' && styles.tabActive]}
          onPress={() => setActiveTab('contributions')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'contributions' && styles.tabTextActive]}>
            📝 Contributions ({contributions.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, { borderBottomColor: colors.border }, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'users' && styles.tabTextActive]}>
            👥 Utilisateurs ({users.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'contributions' ? (
          <>
            {/* Filter Buttons */}
            <View style={styles.filterButtons}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <Pressable
                  key={status}
                  style={[
                    styles.filterButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    filterStatus === status && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: colors.textSecondary },
                      filterStatus === status && styles.filterButtonTextActive,
                    ]}
                  >
                    {status === 'all' && '📋 Tous'}
                    {status === 'pending' && '⏳ En attente'}
                    {status === 'approved' && '✅ Approuvés'}
                    {status === 'rejected' && '❌ Rejetés'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Contributions List */}
            {contributions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune contribution à afficher</Text>
              </View>
            ) : (
              contributions.map((contribution) => (
                <View key={contribution.contribution_id} style={[styles.contributionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.contributionHeader}>
                    <View>
                      <Text style={[styles.contributionWord, { color: colors.text }]}>{contribution.word}</Text>
                      <Text style={[styles.contributionMeta, { color: colors.textSecondary }]}>
                        Par {contribution.users?.username || 'Inconnu'} •{' '}
                        {new Date(contribution.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <View style={styles.contributionBadges}>
                      <View
                        style={[
                          styles.statusBadge,
                          contribution.status === 'pending' && styles.statusPending,
                          contribution.status === 'approved' && styles.statusApproved,
                          contribution.status === 'rejected' && styles.statusRejected,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {contribution.status === 'pending' && '⏳ En attente'}
                          {contribution.status === 'approved' && '✅ Approuvé'}
                          {contribution.status === 'rejected' && '❌ Rejeté'}
                        </Text>
                      </View>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>
                          {contribution.difficulty === 'beginner' && '🌱'}
                          {contribution.difficulty === 'intermediate' && '📚'}
                          {contribution.difficulty === 'advanced' && '🏆'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Image Preview */}
                  {contribution.image_url && (
                    <Image
                      source={{ uri: contribution.image_url }}
                      style={styles.contributionImage}
                      resizeMode="cover"
                    />
                  )}

                  {/* Syllables */}
                  <View style={styles.syllablesSection}>
                    <Text style={[styles.syllablesTitle, { color: colors.text }]}>Syllabes :</Text>
                    {contribution.syllables.map((syllable: any, index: number) => {
                      const handSignImage = handSigns.find(s => s.key === syllable.hand_sign_key);
                      const positionImage = handPositions.find(p => p.configuration_number === syllable.hand_position_config);
                      
                      return (
                        <View key={index} style={[styles.syllableItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <Text style={[styles.syllableText, { color: colors.text }]}>
                            {syllable.text}
                            {syllable.consonne && ` (${syllable.consonne})`}
                          </Text>
                          
                          <View style={styles.syllableImagesRow}>
                            {syllable.hand_sign_key && handSignImage && (
                              <View style={styles.syllableImageContainer}>
                                <Text style={[styles.syllableImageLabel, { color: colors.textSecondary }]}>Configuration: {syllable.hand_sign_key}</Text>
                                <Image
                                  source={{ uri: handSignImage.image_url }}
                                  style={[styles.syllableImage, { width: 160, height: 160 }]}
                                  resizeMode="contain"
                                />
                              </View>
                            )}
                            
                            {syllable.hand_position_config && positionImage && (
                              <View style={styles.syllableImageContainer}>
                                <Text style={[styles.syllableImageLabel, { color: colors.textSecondary }]}>Position: {positionImage.description}</Text>
                                <Image
                                  source={{ uri: positionImage.image_url }}
                                  style={[styles.syllableImage, { width: 160, height: 160 }]}
                                  resizeMode="contain"
                                />
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Action Buttons */}
                  {contribution.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <Pressable
                        style={styles.approveButton}
                        onPress={() =>
                          updateContributionStatus(
                            contribution.contribution_id,
                            'approved',
                            contribution.user_id
                          )
                        }
                      >
                        <Text style={styles.approveButtonText}>✅ Approuver</Text>
                      </Pressable>
                      <Pressable
                        style={styles.rejectButton}
                        onPress={() =>
                          updateContributionStatus(
                            contribution.contribution_id,
                            'rejected',
                            contribution.user_id
                          )
                        }
                      >
                        <Text style={styles.rejectButtonText}>❌ Rejeter</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchSection}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher un utilisateur..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun utilisateur trouvé</Text>
              </View>
            ) : (
              filteredUsers.map((u) => (
                <View key={u.user_id} style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{u.username}</Text>
                    <Text style={[styles.userMeta, { color: colors.textSecondary }]}>
                      Niveau {u.level} • {u.total_points} XP • Streak: {u.current_streak}
                    </Text>
                    <Text style={[styles.userDate, { color: colors.textSecondary }]}>
                      Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <View style={styles.userActions}>
                    <View
                      style={[
                        styles.roleBadge,
                        u.role === 'admin' ? styles.roleAdmin : styles.roleApprenant,
                      ]}
                    >
                      <Text style={styles.roleText}>
                        {u.role === 'admin' ? '🛡️ Admin' : '📚 Apprenant'}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.roleButton}
                      onPress={() =>
                        Alert.alert(
                          'Changer le rôle',
                          `Voulez-vous changer le rôle de ${u.username} ?`,
                          [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: u.role === 'admin' ? 'Apprenant' : 'Admin',
                              onPress: () =>
                                updateUserRole(
                                  u.user_id,
                                  u.role === 'admin' ? 'apprenant' : 'admin'
                                ),
                            },
                          ]
                        )
                      }
                    >
                      <Text style={styles.roleButtonText}>🔄 Changer</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  contributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contributionWord: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  contributionMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  contributionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 16,
  },
  contributionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  syllablesSection: {
    marginBottom: 12,
  },
  syllablesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  syllableItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  syllableText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  syllableConfig: {
    fontSize: 12,
    color: '#3B82F6',
  },
  syllablePosition: {
    fontSize: 12,
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  roleAdmin: {
    backgroundColor: '#DBEAFE',
  },
  roleApprenant: {
    backgroundColor: '#F3F4F6',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  notAuthText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  syllableImagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  syllableImageContainer: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  syllableImageLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  syllableImage: {
    width: 80,
    height: 80,
  },
});
