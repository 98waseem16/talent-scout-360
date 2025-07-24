
export interface ParseResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: {
    parseTime: number;
    inputSize: number;
    tokensProcessed: number;
  };
}

export interface ParseOptions {
  maxInputSize?: number;
  timeoutMs?: number;
  enablePartialParsing?: boolean;
  strictMode?: boolean;
}

export class PythonParser {
  private static readonly DEFAULT_OPTIONS: ParseOptions = {
    maxInputSize: 10 * 1024 * 1024, // 10MB
    timeoutMs: 30000, // 30 seconds
    enablePartialParsing: true,
    strictMode: false
  };

  // Token types for the parser
  private static readonly TOKEN_TYPES = {
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    NULL: 'NULL',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',
    COMMA: 'COMMA',
    COLON: 'COLON',
    WHITESPACE: 'WHITESPACE',
    EOF: 'EOF'
  };

  private input: string = '';
  private position: number = 0;
  private tokens: Array<{ type: string; value: string; position: number }> = [];
  private currentToken: number = 0;
  private warnings: string[] = [];
  private startTime: number = 0;

  async parse(input: string, options: ParseOptions = {}): Promise<ParseResult> {
    const opts = { ...PythonParser.DEFAULT_OPTIONS, ...options };
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

      console.log('=== PARSE ATTEMPT 1: Direct JSON ===');
      
      // Phase 2: Try direct JSON parsing first (fastest and most reliable)
      try {
        const trimmedInput = input.trim();
        const directResult = JSON.parse(trimmedInput);
        console.log('✅ Direct JSON parsing successful');
        
        return {
          success: true,
          data: directResult,
          warnings: this.warnings.length > 0 ? this.warnings : undefined,
          metadata: {
            parseTime: Date.now() - this.startTime,
            inputSize: input.length,
            tokensProcessed: 0
          }
        };
      } catch (jsonError) {
        console.log('❌ Direct JSON parsing failed:', (jsonError as Error).message);
      }

      console.log('=== PARSE ATTEMPT 2: Preprocessed JSON ===');
      
      // Phase 3: Try with preprocessing (for Python-style dictionaries)
      this.input = this.preprocessInput(input);
      this.position = 0;
      this.tokens = [];
      this.currentToken = 0;

      await this.tokenize();

      // Phase 4: Parsing with timeout protection
      const parsePromise = this.parseTokens();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Parse timeout exceeded')), opts.timeoutMs);
      });

      const result = await Promise.race([parsePromise, timeoutPromise]);
      console.log('✅ Preprocessed JSON parsing successful');

      return {
        success: true,
        data: result,
        warnings: this.warnings.length > 0 ? this.warnings : undefined,
        metadata: {
          parseTime: Date.now() - this.startTime,
          inputSize: input.length,
          tokensProcessed: this.tokens.length
        }
      };

    } catch (error) {
      console.log('❌ Preprocessed JSON parsing failed:', (error as Error).message);
      console.log('=== PARSE ATTEMPT 3: Advanced Partial Parsing ===');
      
      // Attempt partial parsing if enabled
      if (opts.enablePartialParsing) {
        const partialResult = await this.attemptPartialParsing(input);
        if (partialResult) {
          console.log(`✅ Partial parsing recovered ${partialResult.jobs?.length || 0} jobs`);
          return {
            success: true,
            data: partialResult,
            warnings: [...this.warnings, 'Partial parsing was used due to errors'],
            metadata: {
              parseTime: Date.now() - this.startTime,
              inputSize: input.length,
              tokensProcessed: this.tokens.length
            }
          };
        }
      }

      console.log('❌ All parsing attempts failed');
      return {
        success: false,
        error: (error as Error).message,
        warnings: this.warnings.length > 0 ? this.warnings : undefined,
        metadata: {
          parseTime: Date.now() - this.startTime,
          inputSize: input.length,
          tokensProcessed: this.tokens.length
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

  private preprocessInput(input: string): string {
    console.log('=== PREPROCESSING INPUT ===');
    
    let processed = input.trim();

    // Handle Python string concatenation with advanced pattern matching
    processed = this.handleStringConcatenation(processed);

    // Convert Python literals to JSON equivalents
    processed = processed.replace(/\bTrue\b/g, 'true');
    processed = processed.replace(/\bFalse\b/g, 'false');
    processed = processed.replace(/\bNone\b/g, 'null');

    // Handle Python multi-line strings
    processed = this.handleMultilineStrings(processed);

    // Clean up any remaining issues
    processed = this.cleanupFormatting(processed);

    console.log('Preprocessing complete');
    return processed;
  }

  private handleStringConcatenation(input: string): string {
    console.log('Processing string concatenation...');
    
    // Enhanced pattern for all concatenation types including mixed quotes
    const patterns = [
      // Same quote types
      { regex: /('(?:[^'\\]|\\.)*')\s+('(?:[^'\\]|\\.)*')/g, type: 'single-single' },
      { regex: /("(?:[^"\\]|\\.)*")\s+("(?:[^"\\]|\\.)*")/g, type: 'double-double' },
      // Mixed quote types (the critical improvement)
      { regex: /('(?:[^'\\]|\\.)*')\s+("(?:[^"\\]|\\.)*")/g, type: 'single-double' },
      { regex: /("(?:[^"\\]|\\.)*")\s+('(?:[^'\\]|\\.)*')/g, type: 'double-single' }
    ];

    let result = input;
    let iterations = 0;
    const maxIterations = 100;
    let hasChanges = true;

    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      iterations++;

      for (const pattern of patterns) {
        const beforeLength = result.length;
        
        result = result.replace(pattern.regex, (match, str1, str2) => {
          // Extract content from quotes
          const content1 = str1.slice(1, -1);
          const content2 = str2.slice(1, -1);
          
          // Combine and escape for JSON
          const combined = content1 + content2;
          const escaped = combined.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          
          return `"${escaped}"`;
        });

        if (result.length !== beforeLength) {
          hasChanges = true;
          console.log(`Applied ${pattern.type} concatenation in iteration ${iterations}`);
        }
      }
    }

    if (iterations >= maxIterations) {
      this.warnings.push('Maximum concatenation iterations reached - some concatenations may be incomplete');
    }

    return result;
  }

  private handleMultilineStrings(input: string): string {
    // Handle triple-quoted strings
    input = input.replace(/'''([\s\S]*?)'''/g, (match, content) => {
      const escaped = content.replace(/\n\s*/g, '\\n').replace(/'/g, "\\'").replace(/"/g, '\\"');
      return `"${escaped}"`;
    });

    input = input.replace(/"""([\s\S]*?)"""/g, (match, content) => {
      const escaped = content.replace(/\n\s*/g, '\\n').replace(/'/g, "\\'").replace(/"/g, '\\"');
      return `"${escaped}"`;
    });

    return input;
  }

  private cleanupFormatting(input: string): string {
    // Remove trailing commas
    input = input.replace(/,(\s*[}\]])/g, '$1');
    
    // Convert remaining single quotes to double quotes (smart conversion)
    return this.smartQuoteConversion(input);
  }

  private smartQuoteConversion(input: string): string {
    const chars = input.split('');
    const result = [];
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const prevChar = i > 0 ? chars[i - 1] : '';
      const isEscaped = prevChar === '\\';

      if ((char === "'" || char === '"') && !isEscaped) {
        if (!inString) {
          inString = true;
          stringChar = char;
          result.push('"'); // Always use double quotes in JSON
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
          result.push('"');
        } else {
          // Different quote inside string - escape it
          result.push('\\' + char);
        }
      } else {
        result.push(char);
      }
    }

    return result.join('');
  }

  private async tokenize(): Promise<void> {
    // Implementation would be here - simplified for now
    // This would create a proper tokenizer for Python-like syntax
    this.tokens = []; // Placeholder
  }

  private async parseTokens(): Promise<any> {
    // For now, fall back to JSON.parse after preprocessing
    // In a full implementation, this would use the tokens
    return JSON.parse(this.input);
  }

  private async attemptPartialParsing(originalInput: string): Promise<any | null> {
    try {
      console.log('Starting advanced partial parsing...');
      
      // Method 1: Extract complete job objects with proper bracket matching
      const jobs = this.extractJobObjects(originalInput);
      if (jobs.length > 0) {
        this.warnings.push(`Partial parsing recovered ${jobs.length} job(s) from corrupted input`);
        return { jobs };
      }

      // Method 2: Try to find and parse the jobs array directly
      const jobsArrayMatch = originalInput.match(/"jobs"\s*:\s*\[([\s\S]*)\]/);
      if (jobsArrayMatch) {
        try {
          const jobsStr = `[${jobsArrayMatch[1]}]`;
          const parsedJobs = JSON.parse(jobsStr);
          if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
            this.warnings.push(`Partial parsing extracted jobs array with ${parsedJobs.length} job(s)`);
            return { jobs: parsedJobs };
          }
        } catch (e) {
          console.log('Jobs array extraction failed:', e);
        }
      }

      console.log('Advanced partial parsing found no recoverable data');
    } catch (error) {
      console.log('Partial parsing error:', error);
    }
    
    return null;
  }

  private extractJobObjects(input: string): any[] {
    const jobs: any[] = [];
    let depth = 0;
    let currentJob = '';
    let inString = false;
    let stringChar = '';
    let escaped = false;
    let foundJobStart = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const prevChar = i > 0 ? input[i - 1] : '';

      // Handle string boundaries
      if ((char === '"' || char === "'") && !escaped) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      escaped = !escaped && char === '\\';

      if (!inString) {
        if (char === '{') {
          depth++;
          if (depth === 1) {
            // Look ahead to see if this might be a job object
            const lookAhead = input.slice(i, i + 200);
            if (lookAhead.includes('"title"') || lookAhead.includes('"company"')) {
              foundJobStart = true;
              currentJob = '';
            }
          }
        } else if (char === '}') {
          depth--;
          if (depth === 0 && foundJobStart) {
            currentJob += char;
            try {
              const job = JSON.parse(currentJob);
              if (job && typeof job === 'object' && (job.title || job.company)) {
                jobs.push(job);
                console.log(`Extracted job: ${job.title || 'Unknown title'}`);
              }
            } catch (e) {
              console.log('Failed to parse extracted job object:', e);
            }
            foundJobStart = false;
            currentJob = '';
            continue;
          }
        }
      }

      if (foundJobStart) {
        currentJob += char;
      }
    }

    return jobs;
  }
}
