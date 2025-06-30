import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit, Eye, Bell, BellOff } from 'lucide-react';

interface WatchlistItem {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  alert_enabled: boolean;
  created_at: string;
  last_match?: string;
}

export default function Watchlists() {
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    indicators: '',
    alert_enabled: true
  });

  // CREATE
  const createWatchlist = async () => {
    if (!formData.name.trim()) return;

    const newWatchlist: WatchlistItem = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      indicators: formData.indicators.split('\n').filter(i => i.trim()),
      alert_enabled: formData.alert_enabled,
      created_at: new Date().toISOString()
    };
    setWatchlists([...watchlists, newWatchlist]);
    resetForm();
  };

  // READ
  const fetchWatchlists = async () => {
    const mockData: WatchlistItem[] = [
      {
        id: '1',
        name: 'High-Risk IPs',
        description: 'Known malicious IP addresses from various threat feeds',
        indicators: ['192.168.1.100', '10.0.0.50', '172.16.0.25'],
        alert_enabled: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        last_match: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        name: 'Phishing Domains',
        description: 'Domains associated with phishing campaigns',
        indicators: ['fake-bank.com', 'phishing-site.org', 'malicious-domain.net'],
        alert_enabled: false,
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    setWatchlists(mockData);
  };

  // UPDATE
  const updateWatchlist = async (id: string) => {
    setWatchlists(watchlists.map(w => 
      w.id === id 
        ? { 
            ...w, 
            name: formData.name,
            description: formData.description,
            indicators: formData.indicators.split('\n').filter(i => i.trim()),
            alert_enabled: formData.alert_enabled
          }
        : w
    ));
    resetForm();
  };

  // UPDATE - Toggle alerts
  const toggleAlerts = async (id: string, enabled: boolean) => {
    setWatchlists(watchlists.map(w => 
      w.id === id ? { ...w, alert_enabled: enabled } : w
    ));
  };

  // DELETE
  const deleteWatchlist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this watchlist?')) {
      setWatchlists(watchlists.filter(w => w.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', indicators: '', alert_enabled: true });
    setIsCreating(false);
    setEditingId(null);
  };

  const editWatchlist = (watchlist: WatchlistItem) => {
    setFormData({
      name: watchlist.name,
      description: watchlist.description,
      indicators: watchlist.indicators.join('\n'),
      alert_enabled: watchlist.alert_enabled
    });
    setEditingId(watchlist.id);
    setIsCreating(true);
  };

  const viewWatchlist = (watchlist: WatchlistItem) => {
    setSelectedWatchlist(watchlist);
    setIsViewDialogOpen(true);
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Watchlists</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Watchlist
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Watchlist' : 'Create New Watchlist'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Watchlist name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <Textarea
              placeholder="Indicators (one per line)&#10;Example:&#10;192.168.1.1&#10;malicious-domain.com&#10;suspicious-hash"
              value={formData.indicators}
              onChange={(e) => setFormData({...formData, indicators: e.target.value})}
              rows={6}
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="alerts"
                checked={formData.alert_enabled}
                onCheckedChange={(checked) => setFormData({...formData, alert_enabled: checked})}
              />
              <label htmlFor="alerts" className="text-sm font-medium">
                Enable alerts for matches
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={editingId ? () => updateWatchlist(editingId) : createWatchlist}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {watchlists.map((watchlist) => (
          <Card key={watchlist.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {watchlist.alert_enabled ? (
                      <Bell className="h-5 w-5 text-green-500" />
                    ) : (
                      <BellOff className="h-5 w-5 text-gray-400" />
                    )}
                    {watchlist.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{watchlist.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={watchlist.alert_enabled ? "default" : "secondary"}>
                    {watchlist.alert_enabled ? "Alerts On" : "Alerts Off"}
                  </Badge>
                  {watchlist.last_match && (
                    <Badge variant="destructive">
                      Recent Match
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Indicators ({watchlist.indicators.length})</p>
                  <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto bg-gray-50 p-2 rounded mt-1">
                    {watchlist.indicators.slice(0, 5).map((indicator, idx) => (
                      <div key={idx} className="font-mono">{indicator}</div>
                    ))}
                    {watchlist.indicators.length > 5 && (
                      <div className="text-blue-600">... and {watchlist.indicators.length - 5} more</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(watchlist.created_at).toLocaleDateString()}
                    {watchlist.last_match && (
                      <span className="ml-2 text-red-600">
                        Last match: {new Date(watchlist.last_match).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Switch
                      checked={watchlist.alert_enabled}
                      onCheckedChange={(checked) => toggleAlerts(watchlist.id, checked)}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => viewWatchlist(watchlist)}>
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editWatchlist(watchlist)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => deleteWatchlist(watchlist.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Watchlist Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Watchlist Details</DialogTitle>
          </DialogHeader>
          {selectedWatchlist && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedWatchlist.name}</h3>
                <p className="text-muted-foreground">{selectedWatchlist.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Status:</label>
                  <Badge variant={selectedWatchlist.alert_enabled ? "default" : "secondary"}>
                    {selectedWatchlist.alert_enabled ? "Alerts Enabled" : "Alerts Disabled"}
                  </Badge>
                </div>
                <div>
                  <label className="font-semibold">Indicators Count:</label>
                  <p>{selectedWatchlist.indicators.length}</p>
                </div>
                <div>
                  <label className="font-semibold">Created:</label>
                  <p>{new Date(selectedWatchlist.created_at).toLocaleString()}</p>
                </div>
                {selectedWatchlist.last_match && (
                  <div>
                    <label className="font-semibold">Last Match:</label>
                    <p className="text-red-600">{new Date(selectedWatchlist.last_match).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="font-semibold">All Indicators:</label>
                <div className="bg-gray-50 p-3 rounded-md max-h-64 overflow-y-auto">
                  {selectedWatchlist.indicators.map((indicator, idx) => (
                    <div key={idx} className="font-mono text-sm py-1">{indicator}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
