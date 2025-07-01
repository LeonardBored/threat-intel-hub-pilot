import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, Plus, Edit, Trash2, Search, Bell, BellOff, Target, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRateLimit } from '@/hooks/useRateLimit';

// Use Supabase types for the Watchlist interface
type Watchlist = Tables<'watchlists'>;

export default function Watchlists() {
  const { user } = useAuth();
  const { checkRateLimit } = useRateLimit();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ip',
    indicators: '',
    alert_threshold: 'medium',
    email_notifications: false,
    slack_notifications: false,
    webhook_notifications: false
  });

  // Fetch watchlists from database
  const fetchWatchlists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlists(data || []);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch watchlists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new watchlist
  const createWatchlist = async () => {
    if (!user) return;
    
    if (!formData.name.trim() || !formData.indicators.trim()) {
      toast({
        title: "Error",
        description: "Name and indicators are required",
        variant: "destructive"
      });
      return;
    }

    // Check rate limit
    const canProceed = await checkRateLimit('watchlist-creation', 5);
    if (!canProceed) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .insert([{
          name: formData.name,
          description: formData.description,
          type: formData.type,
          indicators: formData.indicators.split('\n').map(i => i.trim()).filter(i => i),
          alert_threshold: formData.alert_threshold,
          notification_settings: {
            email: formData.email_notifications,
            slack: formData.slack_notifications,
            webhook: formData.webhook_notifications
          },
          is_active: true,
          match_count: 0,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setWatchlists([data, ...watchlists]);
      resetForm();
      toast({
        title: "Success",
        description: "Watchlist created successfully"
      });
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to create watchlist",
        variant: "destructive"
      });
    }
  };

  // Update watchlist
  const updateWatchlist = async (id: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .update({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          indicators: formData.indicators.split('\n').map(i => i.trim()).filter(i => i),
          alert_threshold: formData.alert_threshold,
          notification_settings: {
            email: formData.email_notifications,
            slack: formData.slack_notifications,
            webhook: formData.webhook_notifications
          }
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setWatchlists(watchlists.map(w => w.id === id ? data : w));
      resetForm();
      toast({
        title: "Success",
        description: "Watchlist updated successfully"
      });
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive"
      });
    }
  };

  // Toggle watchlist status
  const toggleWatchlist = async (id: string, is_active: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('watchlists')
        .update({ is_active })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWatchlists(watchlists.map(w => w.id === id ? { ...w, is_active } : w));
      toast({
        title: "Success",
        description: `Watchlist ${is_active ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist status",
        variant: "destructive"
      });
    }
  };

  // Delete watchlist
  const deleteWatchlist = async (id: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this watchlist?')) return;

    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWatchlists(watchlists.filter(w => w.id !== id));
      toast({
        title: "Success",
        description: "Watchlist deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete watchlist",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'ip',
      indicators: '',
      alert_threshold: 'medium',
      email_notifications: false,
      slack_notifications: false,
      webhook_notifications: false
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const editWatchlist = (watchlist: Watchlist) => {
    const notificationSettings = watchlist.notification_settings as any;
    setFormData({
      name: watchlist.name,
      description: watchlist.description || '',
      type: watchlist.type,
      indicators: watchlist.indicators.join('\n'),
      alert_threshold: watchlist.alert_threshold || 'medium',
      email_notifications: notificationSettings?.email || false,
      slack_notifications: notificationSettings?.slack || false,
      webhook_notifications: notificationSettings?.webhook || false
    });
    setIsCreating(true);
    setEditingId(watchlist.id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ip': return 'bg-blue-900/50 text-blue-300 border-blue-500';
      case 'domain': return 'bg-green-900/50 text-green-300 border-green-500';
      case 'url': return 'bg-purple-900/50 text-purple-300 border-purple-500';
      case 'hash': return 'bg-orange-900/50 text-orange-300 border-orange-500';
      case 'keyword': return 'bg-pink-900/50 text-pink-300 border-pink-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  const getThresholdColor = (threshold: string) => {
    switch (threshold) {
      case 'critical': return 'bg-red-900/50 text-red-300 border-red-500';
      case 'high': return 'bg-orange-900/50 text-orange-300 border-orange-500';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500';
      case 'low': return 'bg-green-900/50 text-green-300 border-green-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  // Filter watchlists
  const filteredWatchlists = watchlists.filter(watchlist => {
    const matchesSearch = watchlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         watchlist.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || watchlist.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && watchlist.is_active) ||
                         (filterStatus === 'inactive' && !watchlist.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  useEffect(() => {
    if (user) {
      fetchWatchlists();
    }
  }, [user]);

  if (!user) {
    return null; // This will be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-3 rounded-lg border border-indigo-500/30">
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Watchlists</h1>
              <p className="text-gray-400">Monitor and track specific security indicators</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">
              {filteredWatchlists.filter(w => w.is_active).length} Active
            </Badge>
            <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Watchlist
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search watchlists by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="hash">Hash</SelectItem>
                  <SelectItem value="keyword">Keyword</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingId ? 'Edit Watchlist' : 'Create New Watchlist'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  placeholder="Watchlist name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="hash">Hash</SelectItem>
                    <SelectItem value="keyword">Keyword</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                rows={2}
              />
              <Textarea
                placeholder="Indicators (one per line)"
                value={formData.indicators}
                onChange={(e) => setFormData({...formData, indicators: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                rows={4}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Select value={formData.alert_threshold} onValueChange={(value) => setFormData({...formData, alert_threshold: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Alert Threshold" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email"
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => setFormData({...formData, email_notifications: checked})}
                    />
                    <Label htmlFor="email" className="text-sm">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slack"
                      checked={formData.slack_notifications}
                      onCheckedChange={(checked) => setFormData({...formData, slack_notifications: checked})}
                    />
                    <Label htmlFor="slack" className="text-sm">Slack</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={editingId ? () => updateWatchlist(editingId) : createWatchlist}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingId ? 'Update Watchlist' : 'Create Watchlist'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-400">Loading watchlists...</div>
          ) : filteredWatchlists.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">No watchlists found</div>
          ) : (
            filteredWatchlists.map((watchlist) => {
              const notificationSettings = watchlist.notification_settings as any;
              return (
                <Card key={watchlist.id} className="bg-black/40 border-gray-700 backdrop-blur-sm hover:bg-black/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        {watchlist.is_active ? (
                          <Bell className="h-5 w-5 text-green-400" />
                        ) : (
                          <BellOff className="h-5 w-5 text-gray-500" />
                        )}
                        {watchlist.name}
                      </CardTitle>
                      <Switch
                        checked={watchlist.is_active || false}
                        onCheckedChange={(checked) => toggleWatchlist(watchlist.id, checked)}
                      />
                    </div>
                    {watchlist.description && (
                      <p className="text-gray-400 text-sm">{watchlist.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(watchlist.type)}>
                        {watchlist.type.toUpperCase()}
                      </Badge>
                      <Badge className={getThresholdColor(watchlist.alert_threshold || 'medium')}>
                        {(watchlist.alert_threshold || 'medium').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Indicators:</span>
                        <span className="font-mono">{watchlist.indicators.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Matches:</span>
                        <span className="font-mono">{watchlist.match_count || 0}</span>
                      </div>
                      {watchlist.last_match && (
                        <div className="flex justify-between">
                          <span>Last Match:</span>
                          <span className="text-xs">{new Date(watchlist.last_match).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {notificationSettings?.email && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">📧 Email</Badge>
                      )}
                      {notificationSettings?.slack && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">💬 Slack</Badge>
                      )}
                      {notificationSettings?.webhook && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">🔗 Webhook</Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-700">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => editWatchlist(watchlist)}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteWatchlist(watchlist.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
