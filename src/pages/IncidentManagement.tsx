import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Edit, Trash2, Clock, User, Shield, Eye, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type SecurityIncident = Tables<'security_incidents'>;

export default function IncidentManagement() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    category: 'other',
    assignee: '',
    reporter: '',
    affected_systems: '',
    resolution_notes: '',
    lessons_learned: '',
    priority: 3,
    estimated_impact: 'medium'
  });

  // Fetch incidents from database
  const fetchIncidents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch incidents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new incident
  const createIncident = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create incidents",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('security_incidents')
        .insert([{
          ...formData,
          user_id: user.id,
          affected_systems: formData.affected_systems.split(',').map(s => s.trim()).filter(s => s),
          tags: [],
          incident_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setIncidents([data, ...incidents]);
      resetForm();
      toast({
        title: "Success",
        description: "Incident created successfully"
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident",
        variant: "destructive"
      });
    }
  };

  // Update incident
  const updateIncident = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update incidents",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData = {
        ...formData,
        affected_systems: formData.affected_systems.split(',').map(s => s.trim()).filter(s => s),
        resolved_date: (formData.status === 'resolved' || formData.status === 'closed') && 
                      !incidents.find(i => i.id === id)?.resolved_date 
                      ? new Date().toISOString() 
                      : incidents.find(i => i.id === id)?.resolved_date
      };

      const { data, error } = await supabase
        .from('security_incidents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIncidents(incidents.map(i => i.id === id ? data : i));
      resetForm();
      toast({
        title: "Success",
        description: "Incident updated successfully"
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident",
        variant: "destructive"
      });
    }
  };

  // Update incident status
  const updateIncidentStatus = async (id: string, status: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update incidents",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData: any = { status };
      if ((status === 'resolved' || status === 'closed') && 
          !incidents.find(i => i.id === id)?.resolved_date) {
        updateData.resolved_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('security_incidents')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setIncidents(incidents.map(i => i.id === id ? { ...i, ...updateData } : i));
      toast({
        title: "Success",
        description: `Incident status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating incident status:', error);
      toast({
        title: "Error",
        description: "Failed to update incident status",
        variant: "destructive"
      });
    }
  };

  // Delete incident
  const deleteIncident = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete incidents",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const { error } = await supabase
        .from('security_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncidents(incidents.filter(i => i.id !== id));
      toast({
        title: "Success",
        description: "Incident deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "Error",
        description: "Failed to delete incident",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      status: 'open',
      category: 'other',
      assignee: '',
      reporter: '',
      affected_systems: '',
      resolution_notes: '',
      lessons_learned: '',
      priority: 3,
      estimated_impact: 'medium'
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const editIncident = (incident: SecurityIncident) => {
    setFormData({
      title: incident.title,
      description: incident.description || '',
      severity: incident.severity,
      status: incident.status,
      category: incident.category || 'other',
      assignee: incident.assignee || '',
      reporter: incident.reporter || '',
      affected_systems: incident.affected_systems?.join(', ') || '',
      resolution_notes: incident.resolution_notes || '',
      lessons_learned: incident.lessons_learned || '',
      priority: incident.priority || 3,
      estimated_impact: incident.estimated_impact || 'medium'
    });
    setEditingId(incident.id);
    setIsCreating(true);
  };

  const viewIncident = (incident: SecurityIncident) => {
    setSelectedIncident(incident);
    setIsViewDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 text-red-300 border-red-500';
      case 'high': return 'bg-orange-900/50 text-orange-300 border-orange-500';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500';
      case 'low': return 'bg-green-900/50 text-green-300 border-green-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-900/50 text-red-300 border-red-500';
      case 'investigating': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500';
      case 'resolved': return 'bg-green-900/50 text-green-300 border-green-500';
      case 'closed': return 'bg-gray-900/50 text-gray-300 border-gray-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'low': return <Shield className="h-5 w-5 text-green-400" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  useEffect(() => {
    fetchIncidents();
  }, [user]);

  // Show loading or login message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 text-white">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-400">Please log in to access incident management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-3 rounded-lg border border-red-500/30">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Security Incidents</h1>
              <p className="text-gray-400">Manage and track security incidents</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              {filteredIncidents.filter(i => i.status === 'open').length} Open
            </Badge>
            <Button onClick={() => setIsCreating(true)} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
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
                  placeholder="Search incidents by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by Severity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Severities</SelectItem>
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
        {isCreating && (
          <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingId ? 'Edit Incident' : 'Report New Incident'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Incident title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
              <Textarea
                placeholder="Incident description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="phishing">Phishing</SelectItem>
                    <SelectItem value="data_breach">Data Breach</SelectItem>
                    <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                    <SelectItem value="ddos">DDoS</SelectItem>
                    <SelectItem value="insider_threat">Insider Threat</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  placeholder="Assignee email"
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
                <Input
                  placeholder="Reporter email"
                  value={formData.reporter}
                  onChange={(e) => setFormData({...formData, reporter: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Input
                placeholder="Affected systems (comma-separated)"
                value={formData.affected_systems}
                onChange={(e) => setFormData({...formData, affected_systems: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
              {(formData.status === 'resolved' || formData.status === 'closed') && (
                <>
                  <Textarea
                    placeholder="Resolution notes"
                    value={formData.resolution_notes}
                    onChange={(e) => setFormData({...formData, resolution_notes: e.target.value})}
                    rows={2}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Textarea
                    placeholder="Lessons learned"
                    value={formData.lessons_learned}
                    onChange={(e) => setFormData({...formData, lessons_learned: e.target.value})}
                    rows={2}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={editingId ? () => updateIncident(editingId) : createIncident}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {editingId ? 'Update Incident' : 'Create Incident'}
                </Button>
                <Button variant="outline" onClick={resetForm} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incidents Grid */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading incidents...</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No incidents found</div>
          ) : (
            filteredIncidents.map((incident) => (
              <Card key={incident.id} className="bg-black/40 border-gray-700 backdrop-blur-sm hover:bg-black/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-white">
                        {getSeverityIcon(incident.severity)}
                        {incident.title}
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">{incident.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {incident.assignee || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Created: {new Date(incident.created_at || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {incident.affected_systems && incident.affected_systems.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-300">Affected Systems:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {incident.affected_systems.map((system, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <Select 
                        value={incident.status} 
                        onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                      >
                        <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => viewIncident(incident)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => editIncident(incident)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteIncident(incident.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Incident Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Incident Details
              </DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(selectedIncident.severity)}
                  <h3 className="font-semibold text-lg">{selectedIncident.title}</h3>
                  <Badge className={getStatusColor(selectedIncident.status)}>
                    {selectedIncident.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-semibold text-gray-300">Severity:</label>
                    <Badge className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-300">Category:</label>
                    <p className="text-gray-400">{selectedIncident.category?.toUpperCase() || 'OTHER'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-300">Assignee:</label>
                    <p className="text-gray-400">{selectedIncident.assignee || 'Unassigned'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-300">Reporter:</label>
                    <p className="text-gray-400">{selectedIncident.reporter || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-300">Priority:</label>
                    <p className="text-gray-400">{selectedIncident.priority || 3}/5</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-300">Created:</label>
                    <p className="text-gray-400">{new Date(selectedIncident.created_at || '').toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="font-semibold text-gray-300">Description:</label>
                  <p className="bg-gray-800/50 p-3 rounded-md text-gray-300 mt-1">{selectedIncident.description}</p>
                </div>
                
                {selectedIncident.affected_systems && selectedIncident.affected_systems.length > 0 && (
                  <div>
                    <label className="font-semibold text-gray-300">Affected Systems:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedIncident.affected_systems.map((system, idx) => (
                        <Badge key={idx} variant="outline" className="border-gray-600 text-gray-400">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedIncident.resolution_notes && (
                  <div>
                    <label className="font-semibold text-gray-300">Resolution Notes:</label>
                    <p className="bg-green-900/20 p-3 rounded-md text-gray-300 mt-1">{selectedIncident.resolution_notes}</p>
                  </div>
                )}

                {selectedIncident.lessons_learned && (
                  <div>
                    <label className="font-semibold text-gray-300">Lessons Learned:</label>
                    <p className="bg-blue-900/20 p-3 rounded-md text-gray-300 mt-1">{selectedIncident.lessons_learned}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
