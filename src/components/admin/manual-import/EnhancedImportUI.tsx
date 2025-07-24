
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Upload, Eye, EyeOff, Info, Zap, Settings, Activity } from 'lucide-react';
import { PythonParser, ParseOptions } from './PythonParser';

interface EnhancedImportUIProps {
  onJobsParsed: (jobs: any[]) => void;
  onError: (error: string) => void;
}

const EnhancedImportUI: React.FC<EnhancedImportUIProps> = ({ onJobsParsed, onError }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseResult, setParseResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [parseOptions, setParseOptions] = useState<ParseOptions>({
    maxInputSize: 10 * 1024 * 1024,
    timeoutMs: 30000,
    enablePartialParsing: true,
    strictMode: false
  });

  const parser = useMemo(() => new PythonParser(), []);

  const inputStats = useMemo(() => {
    if (!input) return null;
    
    const sizeKB = (input.length / 1024).toFixed(1);
    const lines = input.split('\n').length;
    const estimatedJobs = (input.match(/["']title["']\s*:/g) || []).length;
    
    return {
      size: `${sizeKB} KB`,
      lines,
      estimatedJobs,
      complexity: input.includes("'") && input.includes('"') ? 'High (Mixed quotes)' : 'Medium'
    };
  }, [input]);

  const handleParse = useCallback(async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setParseProgress(0);
    setParseResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await parser.parse(input, parseOptions);
      
      clearInterval(progressInterval);
      setParseProgress(100);
      
      if (result.success && result.data) {
        setParseResult(result);
        
        // Extract jobs array
        const jobs = Array.isArray(result.data) ? result.data : result.data.jobs || [];
        onJobsParsed(jobs);
      } else {
        onError(result.error || 'Parsing failed');
        setParseResult(result);
      }
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, [input, parseOptions, parser, onJobsParsed, onError]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          Enhanced Python Parser v2.0
        </CardTitle>
        <CardDescription>
          Advanced parser with tokenization, memory optimization, and enterprise-scale features. 
          Handles large inputs, mixed quotes, and complex Python dictionary structures.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">Input & Parse</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Python Dictionary / JSON Input
                </label>
                <Textarea
                  placeholder={`Enhanced parser supports:

✅ Large inputs (up to ${Math.round((parseOptions.maxInputSize || 0) / 1024 / 1024)}MB)
✅ Mixed quote concatenation: 'hello' "world" → "helloworld"
✅ Multi-line strings and complex formatting
✅ Partial parsing and error recovery
✅ Performance monitoring and timeouts
✅ Memory-efficient streaming for large datasets

Paste your Python dict or JSON here...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              {/* Input Statistics */}
              {inputStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-600">Size</div>
                    <div className="text-lg font-bold">{inputStats.size}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-600">Lines</div>
                    <div className="text-lg font-bold">{inputStats.lines}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-600">Est. Jobs</div>
                    <div className="text-lg font-bold">{inputStats.estimatedJobs}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-600">Complexity</div>
                    <div className="text-sm font-bold">{inputStats.complexity}</div>
                  </div>
                </div>
              )}

              {/* Parse Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleParse}
                  disabled={!input.trim() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Parse & Analyze
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Parsing progress...</span>
                    <span>{Math.round(parseProgress)}%</span>
                  </div>
                  <Progress value={parseProgress} className="w-full" />
                </div>
              )}

              {/* Parse Results */}
              {parseResult && (
                <div className="space-y-4">
                  {parseResult.success ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Parse completed successfully in {parseResult.metadata?.parseTime}ms. 
                        Processed {parseResult.metadata?.tokensProcessed} tokens from {parseResult.metadata?.inputSize} bytes.
                        {parseResult.warnings && ` (${parseResult.warnings.length} warnings)`}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{parseResult.error}</AlertDescription>
                    </Alert>
                  )}

                  {parseResult.warnings && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">Warnings:</div>
                          {parseResult.warnings.map((warning: string, index: number) => (
                            <div key={index} className="text-sm">• {warning}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Max Input Size (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={Math.round((parseOptions.maxInputSize || 0) / 1024 / 1024)}
                  onChange={(e) => setParseOptions(prev => ({
                    ...prev,
                    maxInputSize: parseInt(e.target.value) * 1024 * 1024
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Timeout (seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={Math.round((parseOptions.timeoutMs || 0) / 1000)}
                  onChange={(e) => setParseOptions(prev => ({
                    ...prev,
                    timeoutMs: parseInt(e.target.value) * 1000
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parseOptions.enablePartialParsing}
                  onChange={(e) => setParseOptions(prev => ({
                    ...prev,
                    enablePartialParsing: e.target.checked
                  }))}
                />
                <span className="text-sm">Enable partial parsing (recover data from corrupted input)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parseOptions.strictMode}
                  onChange={(e) => setParseOptions(prev => ({
                    ...prev,
                    strictMode: e.target.checked
                  }))}
                />
                <span className="text-sm">Strict mode (fail on any syntax errors)</span>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {parseResult?.metadata && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {parseResult.metadata.parseTime}ms
                  </div>
                  <div className="text-sm text-blue-600">Parse Time</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(parseResult.metadata.inputSize / 1024)}KB
                  </div>
                  <div className="text-sm text-green-600">Input Size</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {parseResult.metadata.tokensProcessed}
                  </div>
                  <div className="text-sm text-purple-600">Tokens Processed</div>
                </div>
              </div>
            )}
            
            {!parseResult && (
              <div className="text-center py-8 text-gray-500">
                Parse some input to see analytics
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedImportUI;
