
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Shield, AlertTriangle, Eye, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type IOC = Tables<'iocs'>;

export default function ThreatIntelManagement() {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterThreatLevel, setFilterThreatLevel] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{remaining: number; resetTime: number} | null>(null);
  const [formData, setFormData] = useState({
    indicator: '',
    type: 'ip',
    threat_level: 'medium',
    description: '',
    source: '',
    confidence_score: 50
  });

  // Fetch IOCs from database
  const fetchIOCs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('iocs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIocs(data || []);
    } catch (error) {
      console.error('Error fetching IOCs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch IOCs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new IOC with rate limiting
  const createIOC = async () => {
    if (!formData.indicator.trim()) {
      toast({
        title: "Error",
        description: "Indicator is required",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);

    try {
      // Call the Edge Function with rate limiting
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = "https://nlpytrvdrkoiozjrjrqh.supabase.co";
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ioc-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scHl0cnZkcmtvaW96anJqcnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5OTQ5MjYsImV4cCI6MjA2NjU3MDkyNn0.VvjqQDq-2U1MQJ7wLcBt0JfxDsOSJbY5T1MXILWW5Wk'
        },
        body: JSON.stringify({
          ...formData,
          tags: []
        })
      });

      const result = await response.json();

      // Update rate limit info from response headers
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
      const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000;
      setRateLimitInfo({ remaining, resetTime });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          toast({
            title: "Rate Limit Exceeded",
            description: `Too many IOC creations. Please try again in ${retryAfter} seconds.`,
            variant: "destructive"
          });
          return;
        }
        
        throw new Error(result.message || 'Failed to create IOC');
      }

      // Add the new IOC to the list
      setIocs([result.data, ...iocs]);
      resetForm();
      
      // Show rate limit info in success message
      toast({
        title: "Success",
        description: `IOC created successfully. ${remaining} creations remaining this hour.`
      });

    } catch (error) {
      console.error('Error creating IOC:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create IOC",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  // Update IOC
  const updateIOC = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('iocs')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIocs(iocs.map(ioc => ioc.id === id ? data : ioc));
      resetForm();
      toast({
        title: "Success",
        description: "IOC updated successfully"
      });
    } catch (error) {
      console.error('Error updating IOC:', error);
      toast({
        title: "Error",
        description: "Failed to update IOC",
        variant: "destructive"
      });
    }
  };

  // Delete IOC
  const deleteIOC = async (id: string) => {
    if (!confirm('Are you sure you want to delete this IOC?')) return;

    try {
      const { error } = await supabase
        .from('iocs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIocs(iocs.filter(ioc => ioc.id !== id));
      toast({
        title: "Success",
        description: "IOC deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting IOC:', error);
      toast({
        title: "Error",
        description: "Failed to delete IOC",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      indicator: '',
      type: 'ip',
      threat_level: 'medium',
      description: '',
      source: '',
      confidence_score: 50
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const editIOC = (ioc: IOC) => {
    setFormData({
      indicator: ioc.indicator,
      type: ioc.type,
      threat_level: ioc.threat_level,
      description: ioc.description || '',
      source: ioc.source || '',
      confidence_score: ioc.confidence_score || 50
    });
    setIsEditing(true);
    setEditingId(ioc.id);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-900/50 text-red-300 border-red-500';
      case 'high': return 'bg-orange-900/50 text-orange-300 border-orange-500';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500';
      case 'low': return 'bg-green-900/50 text-green-300 border-green-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return '🌐';
      case 'domain': return '🏢';
      case 'url': return '🔗';
      case 'hash': return '#️⃣';
      case 'email': return '📧';
      default: return '❓';
    }
  };

  // Filter IOCs based on search and filters
  const filteredIOCs = iocs.filter(ioc => {
    const matchesSearch = ioc.indicator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ioc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ioc.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || ioc.type === filterType;
    const matchesThreatLevel = filterThreatLevel === 'all' || ioc.threat_level === filterThreatLevel;
    
    return matchesSearch && matchesType && matchesThreatLevel;
  });

  useEffect(() => {
    fetchIOCs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 rounded-lg border border-blue-500/30">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">IOC Management</h1>
              <p className="text-gray-400">Manage threat intelligence indicators of compromise</p>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            {filteredIOCs.length} IOCs
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search IOCs by indicator, description, or source..."
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
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterThreatLevel} onValueChange={setFilterThreatLevel}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Threat Level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isEditing ? 'Edit IOC' : 'Add New IOC'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                placeholder="Indicator (IP, Domain, Hash, etc.)"
                value={formData.indicator}
                onChange={(e) => setFormData({...formData, indicator: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="ip">🌐 IP Address</SelectItem>
                  <SelectItem value="domain">🏢 Domain</SelectItem>
                  <SelectItem value="url">🔗 URL</SelectItem>
                  <SelectItem value="hash">#️⃣ Hash</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Select value={formData.threat_level} onValueChange={(value) => setFormData({...formData, threat_level: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Threat Level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Source"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              rows={3}
            />
            {/* Rate Limit Information */}
            {rateLimitInfo && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Rate Limit Status</span>
                </div>
                <div className="text-xs text-blue-300 mt-1">
                  {rateLimitInfo.remaining} IOC creations remaining this hour
                  {rateLimitInfo.remaining === 0 && (
                    <span className="text-yellow-400 ml-2">
                      (Resets at {new Date(rateLimitInfo.resetTime).toLocaleTimeString()})
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={isEditing ? () => updateIOC(editingId!) : createIOC}
                disabled={creating || (rateLimitInfo?.remaining === 0 && !isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : (isEditing ? 'Update IOC' : 'Create IOC')}
              </Button>
              <Button variant="outline" onClick={resetForm} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* IOCs Table */}
        <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Threat Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading IOCs...</div>
            ) : filteredIOCs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No IOCs found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Indicator</TableHead>
                      <TableHead className="text-gray-300">Threat Level</TableHead>
                      <TableHead className="text-gray-300">Source</TableHead>
                      <TableHead className="text-gray-300">Description</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIOCs.map((ioc) => (
                      <TableRow key={ioc.id} className="border-gray-700 hover:bg-gray-800/30">
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {getTypeIcon(ioc.type)} {ioc.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-blue-400 max-w-xs truncate">
                          {ioc.indicator}
                        </TableCell>
                        <TableCell>
                          <Badge className={getThreatLevelColor(ioc.threat_level)}>
                            {ioc.threat_level.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{ioc.source || 'Unknown'}</TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {ioc.description || 'No description'}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(ioc.created_at || '').toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => editIOC(ioc)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteIOC(ioc.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
