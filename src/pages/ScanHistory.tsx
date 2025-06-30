
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { History, Search, Eye, Trash2, RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type ScanRecord = Tables<'scan_history'>;

export default function ScanHistory() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');

  // Fetch scan history from database
  const fetchScans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scan history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete scan record
  const deleteScan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;

    try {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScans(scans.filter(scan => scan.id !== id));
      toast({
        title: "Success",
        description: "Scan record deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan record",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300 border-green-500';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500';
      case 'failed': return 'bg-red-900/50 text-red-300 border-red-500';
      case 'timeout': return 'bg-orange-900/50 text-orange-300 border-orange-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case 'clean': return 'bg-green-900/50 text-green-300 border-green-500';
      case 'suspicious': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500';
      case 'malicious': return 'bg-red-900/50 text-red-300 border-red-500';
      case 'unknown': return 'bg-gray-900/50 text-gray-300 border-gray-500';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500';
    }
  };

  const getVerdictIcon = (verdict?: string) => {
    switch (verdict) {
      case 'clean': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'suspicious': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'malicious': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'virustotal': return '🦠';
      case 'urlscan': return '🔍';
      case 'hybrid_analysis': return '🧪';
      case 'manual': return '👤';
      default: return '❓';
    }
  };

  // Filter scans based on search and filters
  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || scan.scan_type === filterType;
    const matchesStatus = filterStatus === 'all' || scan.status === filterStatus;
    const matchesVerdict = filterVerdict === 'all' || scan.verdict === filterVerdict;
    
    return matchesSearch && matchesType && matchesStatus && matchesVerdict;
  });

  useEffect(() => {
    fetchScans();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-lg border border-purple-500/30">
              <History className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Scan History</h1>
              <p className="text-gray-400">View and manage security scan records</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              {filteredScans.length} Records
            </Badge>
            <Button onClick={fetchScans} className="bg-purple-600 hover:bg-purple-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
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
                  placeholder="Search by target (URL, IP, domain, hash)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Scan Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="virustotal">VirusTotal</SelectItem>
                  <SelectItem value="urlscan">URLScan.io</SelectItem>
                  <SelectItem value="hybrid_analysis">Hybrid Analysis</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterVerdict} onValueChange={setFilterVerdict}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Verdict" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Verdicts</SelectItem>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                  <SelectItem value="malicious">Malicious</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Scans Table */}
        <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              Security Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading scan history...</div>
            ) : filteredScans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No scan records found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Target</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Verdict</TableHead>
                      <TableHead className="text-gray-300">Threat Score</TableHead>
                      <TableHead className="text-gray-300">Duration</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScans.map((scan) => (
                      <TableRow key={scan.id} className="border-gray-700 hover:bg-gray-800/30">
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {getScanTypeIcon(scan.scan_type)} {scan.scan_type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-blue-400 max-w-xs truncate">
                          {scan.target}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(scan.status)}>
                            {scan.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getVerdictIcon(scan.verdict)}
                            <Badge className={getVerdictColor(scan.verdict)}>
                              {scan.verdict?.toUpperCase() || 'UNKNOWN'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {scan.threat_score !== undefined && scan.threat_score !== null ? `${scan.threat_score}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {scan.scan_duration ? `${scan.scan_duration}s` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(scan.created_at || '').toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {new Date(scan.created_at || '').toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                              onClick={() => {
                                // View scan details logic here
                                toast({
                                  title: "Scan Details",
                                  description: `Viewing details for ${scan.target}`
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteScan(scan.id)}
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
