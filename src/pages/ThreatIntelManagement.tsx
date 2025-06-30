import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface IOC {
  id: string;
  indicator: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export default function ThreatIntelManagement() {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    indicator: '',
    type: 'ip' as const,
    threat_level: 'medium' as const,
    description: '',
    source: ''
  });

  // CREATE
  const createIOC = async () => {
    const newIOC: IOC = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setIocs([...iocs, newIOC]);
    resetForm();
  };

  // READ
  const fetchIOCs = async () => {
    // Implementation with Supabase
    const mockData: IOC[] = [
      {
        id: '1',
        indicator: '192.168.1.100',
        type: 'ip',
        threat_level: 'high',
        description: 'Suspicious IP address from botnet',
        source: 'AlienVault',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        indicator: 'malicious-domain.com',
        type: 'domain',
        threat_level: 'critical',
        description: 'Known C2 domain',
        source: 'ThreatFox',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setIocs(mockData);
  };

  // UPDATE
  const updateIOC = async (id: string) => {
    setIocs(iocs.map(ioc => 
      ioc.id === id 
        ? { ...ioc, ...formData, updated_at: new Date().toISOString() }
        : ioc
    ));
    resetForm();
  };

  // DELETE
  const deleteIOC = async (id: string) => {
    setIocs(iocs.filter(ioc => ioc.id !== id));
  };

  const resetForm = () => {
    setFormData({
      indicator: '',
      type: 'ip',
      threat_level: 'medium',
      description: '',
      source: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const editIOC = (ioc: IOC) => {
    setFormData({
      indicator: ioc.indicator,
      type: ioc.type,
      threat_level: ioc.threat_level,
      description: ioc.description,
      source: ioc.source
    });
    setIsEditing(true);
    setEditingId(ioc.id);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  useEffect(() => {
    fetchIOCs();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">IOC Management</h1>
      
      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit IOC' : 'Add New IOC'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Indicator (IP, Domain, Hash, etc.)"
            value={formData.indicator}
            onChange={(e) => setFormData({...formData, indicator: e.target.value})}
          />
          <select 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value as any})}
            className="w-full p-2 border rounded-md"
          >
            <option value="ip">IP Address</option>
            <option value="domain">Domain</option>
            <option value="url">URL</option>
            <option value="hash">Hash</option>
            <option value="email">Email</option>
          </select>
          <select 
            value={formData.threat_level}
            onChange={(e) => setFormData({...formData, threat_level: e.target.value as any})}
            className="w-full p-2 border rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <Input
            placeholder="Source"
            value={formData.source}
            onChange={(e) => setFormData({...formData, source: e.target.value})}
          />
          <div className="flex gap-2">
            <Button onClick={isEditing ? () => updateIOC(editingId!) : createIOC}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* IOCs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Indicators ({iocs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Threat Level</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iocs.map((ioc) => (
                <TableRow key={ioc.id}>
                  <TableCell className="font-mono">{ioc.indicator}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ioc.type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getThreatLevelColor(ioc.threat_level) as any}>
                      {ioc.threat_level.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{ioc.source}</TableCell>
                  <TableCell className="max-w-xs truncate">{ioc.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editIOC(ioc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteIOC(ioc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
