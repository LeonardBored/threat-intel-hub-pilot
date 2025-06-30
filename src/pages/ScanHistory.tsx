import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Eye, Download, Search, Calendar } from 'lucide-react';

interface ScanRecord {
  id: string;
  scan_type: 'virustotal' | 'urlscan' | 'manual';
  target: string;
  result: 'clean' | 'malicious' | 'suspicious' | 'error';
  details: any;
  created_at: string;
}

export default function ScanHistory() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // READ - Fetch scan history
  const fetchScanHistory = async () => {
    const mockData: ScanRecord[] = [
      {
        id: '1',
        scan_type: 'virustotal',
        target: '192.168.1.1',
        result: 'clean',
        details: { positives: 0, total: 75, scan_date: new Date().toISOString() },
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: '2',
        scan_type: 'urlscan',
        target: 'https://suspicious-site.com',
        result: 'malicious',
        details: { 
          verdict: 'malicious', 
          brands: ['phishing'],
          screenshot: 'screenshot_url',
          scan_date: new Date().toISOString()
        },
        created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: '3',
        scan_type: 'manual',
        target: 'example.com',
        result: 'suspicious',
        details: { 
          notes: 'Manual investigation shows suspicious patterns',
          analyst: 'security_team',
          scan_date: new Date().toISOString()
        },
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];
    setScans(mockData);
  };

  // DELETE - Remove scan record
  const deleteScan = async (id: string) => {
    setScans(scans.filter(scan => scan.id !== id));
  };

  // Bulk DELETE
  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all scan history?')) {
      setScans([]);
    }
  };

  // Export scan data
  const exportScan = (scan: ScanRecord) => {
    const dataStr = JSON.stringify(scan, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scan_${scan.target}_${scan.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const viewScanDetails = (scan: ScanRecord) => {
    setSelectedScan(scan);
    setIsDialogOpen(true);
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'clean': return 'default';
      case 'malicious': return 'destructive';
      case 'suspicious': return 'secondary';
      case 'error': return 'outline';
      default: return 'secondary';
    }
  };

  const getScanTypeColor = (type: string) => {
    switch (type) {
      case 'virustotal': return 'bg-blue-100 text-blue-800';
      case 'urlscan': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredScans = scans.filter(scan => 
    scan.target.toLowerCase().includes(filter.toLowerCase()) ||
    scan.scan_type.toLowerCase().includes(filter.toLowerCase()) ||
    scan.result.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    fetchScanHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scan History</h1>
        <Button variant="destructive" onClick={clearHistory}>
          Clear All History
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by target, scan type, or result..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan Records ({filteredScans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Scan Type</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-mono max-w-xs truncate">{scan.target}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScanTypeColor(scan.scan_type)}`}>
                      {scan.scan_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getResultColor(scan.result) as any}>
                      {scan.result.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(scan.created_at).toLocaleDateString()} {new Date(scan.created_at).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => viewScanDetails(scan)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportScan(scan)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteScan(scan.id)}>
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

      {/* Scan Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
          </DialogHeader>
          {selectedScan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Target:</label>
                  <p className="font-mono">{selectedScan.target}</p>
                </div>
                <div>
                  <label className="font-semibold">Scan Type:</label>
                  <p>{selectedScan.scan_type}</p>
                </div>
                <div>
                  <label className="font-semibold">Result:</label>
                  <Badge variant={getResultColor(selectedScan.result) as any}>
                    {selectedScan.result.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="font-semibold">Date:</label>
                  <p>{new Date(selectedScan.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="font-semibold">Details:</label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-64">
                  {JSON.stringify(selectedScan.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
