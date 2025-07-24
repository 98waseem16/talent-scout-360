/**
 * Enhanced Python Parser with Sonnet's Improvements
 * Combines the best features of both parsers for robust JSON conversion
 */

export interface ParseResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: {
    parseTime: number;
    inputSize: number;
    tokensProcessed: number;
    method?: 'json' | 'eval' | 'partial';
  };
}

export interface ParseOptions {
  maxInputSize?: number;
  timeoutMs?: number;
  enablePartialParsing?: boolean;
  strictMode?: boolean;
  indentSize?: number;
  preserveOrder?: boolean;
}

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
  private static timers = new Map<string, number>();
  
  static start(label: string): void {
    this.timers.set(label, performance.now());
  }
  
  static end(label: string): number {
    const start = this.timers.get(label);
    if (!start) {
      throw new Error(`Timer '${label}' not found`);
    }
    
    const duration = performance.now() - start;
    this.timers.delete(label);
    return duration;
  }
  
  static measure<T>(label: string, fn: () => T): { result: T, duration: number } {
    this.start(label);
    const result = fn();
    const duration = this.end(label);
    return { result, duration };
  }
}

/**
 * Enhanced Python Parser with improved preprocessing and error handling
 */
export class EnhancedPythonParser {
  private static readonly DEFAULT_OPTIONS: Required<ParseOptions> = {
    maxInputSize: 10 * 1024 * 1024, // 10MB
    timeoutMs: 30000, // 30 seconds
    enablePartialParsing: true,
    strictMode: false,
    indentSize: 2,
    preserveOrder: true
  };

  private warnings: string[] = [];
  private startTime: number = 0;

  async parse(input: string, options: ParseOptions = {}): Promise<ParseResult> {
    const opts = { ...EnhancedPythonParser.DEFAULT_OPTIONS, ...options };
    this.startTime = Date.now();
    this.warnings = [];

    try {
      // Phase 1: Input validation
      const validationResult = this.validateInput(input, opts);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error,
          metadata: {
            parseTime: Date.now() - this.startTime,
            inputSize: input.length,
            tokensProcessed: 0
          }
        };
      }

      // Phase 2: Enhanced preprocessing with performance monitoring
      const { result: preprocessed, duration: preprocessTime } = PerformanceMonitor.measure(
        'preprocess',
        () => this.preprocess(input)
      );

      // Phase 3: Dual parsing strategy with timeout protection
      const parsePromise = this.dualParse(preprocessed, opts);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Parse timeout exceeded')), opts.timeoutMs);
      });

      const { result: data, method } = await Promise.race([parsePromise, timeoutPromise]);

      return {
        success: true,
        data,
        warnings: this.warnings.length > 0 ? this.warnings : undefined,
        metadata: {
          parseTime: Date.now() - this.startTime,
          inputSize: input.length,
          tokensProcessed: preprocessed.length,
          method
        }
      };

    } catch (error) {
      console.error('Parse error:', error);
      
      // Attempt partial parsing if enabled
      if (opts.enablePartialParsing) {
        const partialResult = await this.attemptPartialParsing(input);
        if (partialResult) {
          return {
            success: true,
            data: partialResult,
            warnings: [...this.warnings, 'Partial parsing was used due to errors'],
            metadata: {
              parseTime: Date.now() - this.startTime,
              inputSize: input.length,
              tokensProcessed: 0,
              method: 'partial'
            }
          };
        }
      }

      return {
        success: false,
        error: (error as Error).message,
        warnings: this.warnings.length > 0 ? this.warnings : undefined,
        metadata: {
          parseTime: Date.now() - this.startTime,
          inputSize: input.length,
          tokensProcessed: 0
        }
      };
    }
  }

  private validateInput(input: string, options: ParseOptions): { valid: boolean; error?: string } {
    if (!input || input.trim().length === 0) {
      return { valid: false, error: 'Input is empty' };
    }

    if (input.length > (options.maxInputSize || 10485760)) {
      return { valid: false, error: `Input size exceeds maximum limit of ${options.maxInputSize} bytes` };
    }

    return { valid: true };
  }

  /**
   * Enhanced preprocessing with Sonnet's improvements
   */
  private preprocess(input: string): string {
    let processed = input.trim();
    
    // Step 1: Handle multi-line strings with placeholder system (Sonnet's approach)
    const multilineStrings = new Map<string, string>();
    let counter = 0;
    
    // Extract multi-line strings more carefully
    processed = processed.replace(/(['"])((?:(?!\1)[^\\]|\\.)*)?\1/gs, (match) => {
      if (match.includes('\n') || match.includes('\r')) {
        const placeholder = `__MULTILINE_${counter++}__`;
        multilineStrings.set(placeholder, match);
        return `"${placeholder}"`;
      }
      return match;
    });
    
    // Step 2: Convert Python literals
    processed = processed.replace(/\bTrue\b/g, 'true');
    processed = processed.replace(/\bFalse\b/g, 'false');
    processed = processed.replace(/\bNone\b/g, 'null');
    
    // Step 3: Handle string concatenation with simplified approach (Claude's method)
    processed = this.handleStringConcatenationSimple(processed);
    
    // Step 4: Convert single quotes to double quotes more carefully
    processed = processed.replace(/'/g, '"');
    
    // Step 5: Remove trailing commas
    processed = processed.replace(/,(\s*[}\]])/g, '$1');
    
    // Step 6: Restore multi-line strings with proper escaping (Sonnet's approach)
    multilineStrings.forEach((value, placeholder) => {
      let cleanValue = value.slice(1, -1); // Remove outer quotes
      
      // Properly escape the content
      cleanValue = cleanValue
        .replace(/\\/g, '\\\\')           // Escape backslashes first
        .replace(/"/g, '\\"')             // Escape quotes
        .replace(/\n/g, '\\n')            // Escape newlines
        .replace(/\r/g, '\\r')            // Escape carriage returns
        .replace(/\t/g, '\\t')            // Escape tabs
        .replace(/'/g, "\\'");            // Escape single quotes
      
      processed = processed.replace(`"${placeholder}"`, `"${cleanValue}"`);
    });
    
    return processed;
  }

  /**
   * Simplified string concatenation handling (Claude's approach)
   */
  private handleStringConcatenationSimple(input: string): string {
    // Handle string concatenation with a single, more robust regex
    // This matches adjacent strings separated by whitespace
    return input.replace(/(['"])((?:(?!\1)[^\\]|\\.)*)?\1\s+(['"])((?:(?!\3)[^\\]|\\.)*)?\3/g, (match, quote1, content1, quote2, content2) => {
      // Combine the content and return as a single double-quoted string
      const combined = (content1 || '') + (content2 || '');
      return `"${combined}"`;
    });
  }

  /**
   * Enhanced string cleaning with Unicode support (Sonnet's approach)
   */
  private cleanStrings(input: string): string {
    return input.replace(/"([^"]*)"/g, (match, content) => {
      const cleaned = content
        // First handle existing backslashes to prevent double escaping
        .replace(/\\\\/g, '__DOUBLE_BACKSLASH__')
        .replace(/\\"/g, '__ESCAPED_QUOTE__')
        .replace(/\\n/g, '__ESCAPED_NEWLINE__')
        .replace(/\\r/g, '__ESCAPED_CR__')
        .replace(/\\t/g, '__ESCAPED_TAB__')
        // Now handle unescaped characters
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        // Restore previously escaped content
        .replace(/__DOUBLE_BACKSLASH__/g, '\\\\')
        .replace(/__ESCAPED_QUOTE__/g, '\\"')
        .replace(/__ESCAPED_NEWLINE__/g, '\\n')
        .replace(/__ESCAPED_CR__/g, '\\r')
        .replace(/__ESCAPED_TAB__/g, '\\t')
        // Handle smart quotes and problematic characters
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        // Replace other problematic non-ASCII characters
        .replace(/[^\x20-\x7E\n\r\t]/g, (char) => {
          return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
        });
      
      return `"${cleaned}"`;
    });
  }

  private escapeForJSON(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Dual parsing strategy: JSON.parse first, then eval fallback (Sonnet's approach)
   */
  private async dualParse(input: string, options: ParseOptions): Promise<{ result: any; method: 'json' | 'eval' }> {
    try {
      // Try JSON.parse first (fastest and safest)
      const result = JSON.parse(input);
      return { result, method: 'json' };
    } catch (jsonError) {
      if (options.strictMode) {
        throw new Error('Invalid JSON format and strict mode is enabled');
      }
      
      try {
        // Fallback to eval (less safe but handles more Python syntax)
        const safeEval = new Function('return ' + input);
        const result = safeEval();
        this.warnings.push('Used eval fallback for parsing - consider improving input format');
        return { result, method: 'eval' };
      } catch (evalError) {
        throw new Error(`Both JSON and eval parsing failed. JSON error: ${(jsonError as Error).message}, Eval error: ${(evalError as Error).message}`);
      }
    }
  }

  /**
   * Enhanced partial parsing with better object extraction
   */
  private async attemptPartialParsing(input: string): Promise<any | null> {
    try {
      // Enhanced regex to find job-like objects
      const jobPatterns = [
        /\{[^{}]*"title"[^{}]*\}/g,
        /\{[^{}]*"company"[^{}]*\}/g,
        /\{[^{}]*"position"[^{}]*\}/g
      ];

      const allMatches = new Set<string>();
      
      for (const pattern of jobPatterns) {
        const matches = input.match(pattern);
        if (matches) {
          matches.forEach(match => allMatches.add(match));
        }
      }

      if (allMatches.size > 0) {
        const jobs = [];
        for (const match of allMatches) {
          try {
            // Try to clean and parse each match
            const cleaned = this.preprocess(match);
            const job = JSON.parse(cleaned);
            jobs.push(job);
          } catch {
            // Skip invalid jobs
          }
        }
        
        if (jobs.length > 0) {
          this.warnings.push(`Partial parsing recovered ${jobs.length} job(s) from corrupted input`);
          return Array.isArray(jobs) && jobs.length === 1 ? jobs[0] : { jobs };
        }
      }
    } catch {
      // Partial parsing failed
    }
    
    return null;
  }
}

/**
 * Batch processor for handling multiple inputs concurrently
 */
export class BatchPythonProcessor {
  private parser: EnhancedPythonParser;
  
  constructor(private options: ParseOptions = {}) {
    this.parser = new EnhancedPythonParser();
  }

  /**
   * Process multiple inputs concurrently
   */
  async processBatch(inputs: string[]): Promise<Array<{
    success: boolean;
    result?: any;
    error?: string;
    index: number;
    metadata?: any;
  }>> {
    const promises = inputs.map(async (input, index) => {
      try {
        const result = await this.parser.parse(input, this.options);
        return {
          success: result.success,
          result: result.data,
          error: result.error,
          metadata: result.metadata,
          index
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          index
        };
      }
    });
    
    const results = await Promise.all(promises);
    return results.sort((a, b) => a.index - b.index);
  }
}

// Export the performance monitor for external use
export { PerformanceMonitor };