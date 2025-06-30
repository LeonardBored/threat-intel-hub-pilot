import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Edit, Trash2, Clock, User, Shield } from 'lucide-react';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignee: string;
  affected_systems: string[];
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
}

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as const,
    status: 'open' as const,
    assignee: '',
    affected_systems: '',
    resolution_notes: ''
  });

  // CREATE
  const createIncident = async () => {
    if (!formData.title.trim()) return;

    const newIncident: SecurityIncident = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      status: formData.status,
      assignee: formData.assignee,
      affected_systems: formData.affected_systems.split(',').map(s => s.trim()).filter(s => s),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolution_notes: formData.resolution_notes
    };
    setIncidents([...incidents, newIncident]);
    resetForm();
  };

  // READ
  const fetchIncidents = async () => {
    const mockData: SecurityIncident[] = [
      {
        id: '1',
        title: 'Suspicious Network Activity Detected',
        description: 'Unusual outbound traffic patterns detected from server 192.168.1.50',
        severity: 'high',
        status: 'investigating',
        assignee: 'john.doe@company.com',
        affected_systems: ['web-server-01', 'database-server'],
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: '2',
        title: 'Phishing Email Campaign',
        description: 'Multiple employees reported receiving phishing emails with malicious attachments',
        severity: 'critical',
        status: 'open',
        assignee: 'security-team@company.com',
        affected_systems: ['email-server', 'user-workstations'],
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        title: 'Failed Login Attempts',
        description: 'Multiple failed login attempts detected on admin accounts',
        severity: 'medium',
        status: 'resolved',
        assignee: 'jane.smith@company.com',
        affected_systems: ['admin-portal'],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 43200000).toISOString(),
        resolution_notes: 'Implemented additional rate limiting and account lockout policies'
      }
    ];
    setIncidents(mockData);
  };

  // UPDATE
  const updateIncident = async (id: string) => {
    setIncidents(incidents.map(incident => 
      incident.id === id 
        ? { 
            ...incident, 
            ...formData,
            affected_systems: formData.affected_systems.split(',').map(s => s.trim()).filter(s => s),
            updated_at: new Date().toISOString()
          }
        : incident
    ));
    resetForm();
  };

  // UPDATE - Status only
  const updateIncidentStatus = async (id: string, status: SecurityIncident['status']) => {
    setIncidents(incidents.map(incident => 
      incident.id === id 
        ? { ...incident, status, updated_at: new Date().toISOString() }
        : incident
    ));
  };

  // DELETE
  const deleteIncident = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      setIncidents(incidents.filter(incident => incident.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      status: 'open',
      assignee: '',
      affected_systems: '',
      resolution_notes: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const editIncident = (incident: SecurityIncident) => {
    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      assignee: incident.assignee,
      affected_systems: incident.affected_systems.join(', '),
      resolution_notes: incident.resolution_notes || ''
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
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Shield className="h-5 w-5 text-green-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && incident.severity !== filterSeverity) return false;
    return true;
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Incidents</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Incident' : 'Report New Incident'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Incident title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <Textarea
              placeholder="Incident description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.severity} onValueChange={(value: any) => setFormData({...formData, severity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Assignee email"
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
            />
            <Input
              placeholder="Affected systems (comma-separated)"
              value={formData.affected_systems}
              onChange={(e) => setFormData({...formData, affected_systems: e.target.value})}
            />
            {(formData.status === 'resolved' || formData.status === 'closed') && (
              <Textarea
                placeholder="Resolution notes"
                value={formData.resolution_notes}
                onChange={(e) => setFormData({...formData, resolution_notes: e.target.value})}
                rows={2}
              />
            )}
            <div className="flex gap-2">
              <Button onClick={editingId ? () => updateIncident(editingId) : createIncident}>
                {editingId ? 'Update Incident' : 'Create Incident'}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} className={`border-l-4 ${getSeverityColor(incident.severity)}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {getSeverityIcon(incident.severity)}
                    {incident.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{incident.severity.toUpperCase()}</Badge>
                  <Badge variant={getStatusColor(incident.status) as any}>
                    {incident.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Assigned to: {incident.assignee || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Created: {new Date(incident.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {incident.affected_systems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Affected Systems:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {incident.affected_systems.map((system, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <Select 
                    value={incident.status} 
                    onValueChange={(value: any) => updateIncidentStatus(incident.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewIncident(incident)}>
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => editIncident(incident)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteIncident(incident.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Incident Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedIncident.severity)}
                <h3 className="font-semibold text-lg">{selectedIncident.title}</h3>
                <Badge variant={getStatusColor(selectedIncident.status) as any}>
                  {selectedIncident.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Severity:</label>
                  <Badge variant="outline">{selectedIncident.severity.toUpperCase()}</Badge>
                </div>
                <div>
                  <label className="font-semibold">Assignee:</label>
                  <p>{selectedIncident.assignee || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="font-semibold">Created:</label>
                  <p>{new Date(selectedIncident.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-semibold">Last Updated:</label>
                  <p>{new Date(selectedIncident.updated_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="font-semibold">Description:</label>
                <p className="bg-gray-50 p-3 rounded-md">{selectedIncident.description}</p>
              </div>
              
              {selectedIncident.affected_systems.length > 0 && (
                <div>
                  <label className="font-semibold">Affected Systems:</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedIncident.affected_systems.map((system, idx) => (
                      <Badge key={idx} variant="outline">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedIncident.resolution_notes && (
                <div>
                  <label className="font-semibold">Resolution Notes:</label>
                  <p className="bg-green-50 p-3 rounded-md">{selectedIncident.resolution_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
