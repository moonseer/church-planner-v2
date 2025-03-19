import logger from './logger';

/**
 * Simple template renderer for notification templates
 * Replaces variables in {{variableName}} format
 */
class TemplateRenderer {
  /**
   * Render a template by replacing variables
   * @param template Template string with variables in {{variableName}} format
   * @param variables Object containing variable values
   * @returns Rendered template string
   */
  public render(template: string, variables: Record<string, any>): string {
    if (!template) {
      return '';
    }
    
    try {
      // Replace all {{variableName}} with corresponding values
      return template.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        variableName = variableName.trim();
        
        // Handle nested properties with dot notation (e.g., {{user.name}})
        if (variableName.includes('.')) {
          const parts = variableName.split('.');
          let value = variables;
          
          for (const part of parts) {
            if (value === undefined || value === null) {
              return match; // Keep original if path is invalid
            }
            value = value[part];
          }
          
          return this.formatValue(value, match);
        }
        
        // Handle simple variables
        return this.formatValue(variables[variableName], match);
      });
    } catch (error) {
      logger.error('Error rendering template', { error });
      return template; // Return original template on error
    }
  }
  
  /**
   * Format a value for template rendering
   * @param value Value to format
   * @param defaultValue Default value if value is undefined
   * @returns Formatted value
   */
  private formatValue(value: any, defaultValue: string): string {
    if (value === undefined || value === null) {
      return defaultValue; // Keep original template variable
    }
    
    // Handle dates
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    // Handle objects and arrays by converting to JSON
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Convert other types to string
    return String(value);
  }
  
  /**
   * Extract variable names from a template
   * @param template Template string
   * @returns Array of variable names
   */
  public extractVariables(template: string): string[] {
    if (!template) {
      return [];
    }
    
    const variables = new Set<string>();
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    
    for (const match of matches) {
      // Extract variable name without {{ }}
      const variableName = match.substring(2, match.length - 2).trim();
      variables.add(variableName);
    }
    
    return Array.from(variables);
  }
  
  /**
   * Validate that all required variables are present
   * @param requiredVariables Array of required variable names
   * @param providedVariables Object containing provided variables
   * @returns Object with validation result and missing variables
   */
  public validateVariables(
    requiredVariables: string[],
    providedVariables: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    for (const variable of requiredVariables) {
      if (variable.includes('.')) {
        // Handle nested properties
        const parts = variable.split('.');
        let value = providedVariables;
        let isMissing = false;
        
        for (const part of parts) {
          if (value === undefined || value === null) {
            isMissing = true;
            break;
          }
          value = value[part];
        }
        
        if (isMissing || value === undefined) {
          missing.push(variable);
        }
      } else if (providedVariables[variable] === undefined) {
        // Handle simple variables
        missing.push(variable);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
}

// Export a singleton instance
export default new TemplateRenderer(); 