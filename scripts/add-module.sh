#!/bin/bash

# 2TalkLink Module Generator
# Adds modular components without interfering with existing code

set -e

MODULE_NAME=$1
MODULE_TYPE=${2:-"feature"}  # feature, component, service, util

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: $0 <module-name> [module-type]"
    echo "Module types: feature, component, service, util"
    exit 1
fi

# Convert module name to different cases
MODULE_PASCAL=$(echo $MODULE_NAME | sed -r 's/(^|-)([a-z])/\U\2/g')
MODULE_CAMEL=$(echo $MODULE_PASCAL | sed 's/^./\l&/')
MODULE_KEBAB=$(echo $MODULE_NAME | tr '[:upper:]' '[:lower:]' | sed 's/_/-/g')

echo "🚀 Creating module: $MODULE_NAME ($MODULE_TYPE)"

# Create module directory structure
MODULE_DIR="client/src/modules/${MODULE_KEBAB}"
mkdir -p "$MODULE_DIR"

case $MODULE_TYPE in
    "feature")
        # Full feature module with components, hooks, types
        mkdir -p "$MODULE_DIR/components"
        mkdir -p "$MODULE_DIR/hooks"
        mkdir -p "$MODULE_DIR/types"
        mkdir -p "$MODULE_DIR/utils"
        
        # Create main component
        cat > "$MODULE_DIR/components/${MODULE_PASCAL}.tsx" << EOF
import React from 'react';
import { ${MODULE_PASCAL}Props } from '../types';

export const ${MODULE_PASCAL}: React.FC<${MODULE_PASCAL}Props> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={\`${MODULE_KEBAB}-container \${className}\`}
      data-testid="${MODULE_KEBAB}-main"
      {...props}
    >
      {children || <p>Welcome to ${MODULE_PASCAL} Module</p>}
    </div>
  );
};

export default ${MODULE_PASCAL};
EOF

        # Create types file
        cat > "$MODULE_DIR/types/index.ts" << EOF
export interface ${MODULE_PASCAL}Props {
  children?: React.ReactNode;
  className?: string;
}

export interface ${MODULE_PASCAL}Config {
  enabled: boolean;
  settings?: Record<string, any>;
}
EOF

        # Create custom hook
        cat > "$MODULE_DIR/hooks/use${MODULE_PASCAL}.ts" << EOF
import { useState, useEffect } from 'react';
import { ${MODULE_PASCAL}Config } from '../types';

export const use${MODULE_PASCAL} = (config: ${MODULE_PASCAL}Config = { enabled: true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.enabled) return;
    
    // Initialize module logic here
    setIsLoading(true);
    
    // Simulate initialization
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, [config.enabled]);

  return {
    isLoading,
    error,
    config
  };
};
EOF

        # Create main index file
        cat > "$MODULE_DIR/index.ts" << EOF
// Main exports for ${MODULE_PASCAL} module
export { ${MODULE_PASCAL} } from './components/${MODULE_PASCAL}';
export { use${MODULE_PASCAL} } from './hooks/use${MODULE_PASCAL}';
export type { ${MODULE_PASCAL}Props, ${MODULE_PASCAL}Config } from './types';

// Module metadata
export const ${MODULE_CAMEL}Module = {
  name: '${MODULE_PASCAL}',
  version: '1.0.0',
  description: '${MODULE_PASCAL} module for 2TalkLink',
  type: 'feature'
};
EOF
        ;;
        
    "component")
        # Simple component module
        cat > "$MODULE_DIR/index.tsx" << EOF
import React from 'react';

export interface ${MODULE_PASCAL}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${MODULE_PASCAL}: React.FC<${MODULE_PASCAL}Props> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={\`${MODULE_KEBAB}-component \${className}\`}
      data-testid="${MODULE_KEBAB}-component"
      {...props}
    >
      {children}
    </div>
  );
};

export default ${MODULE_PASCAL};
EOF
        ;;
        
    "service")
        # Service/API module
        mkdir -p "$MODULE_DIR/api"
        mkdir -p "$MODULE_DIR/types"
        
        cat > "$MODULE_DIR/api/${MODULE_CAMEL}Service.ts" << EOF
import { apiRequest } from '@/lib/queryClient';

export class ${MODULE_PASCAL}Service {
  private static baseUrl = '/api/${MODULE_KEBAB}';

  static async get(id?: string) {
    const url = id ? \`\${this.baseUrl}/\${id}\` : this.baseUrl;
    const response = await apiRequest('GET', url);
    return response.json();
  }

  static async create(data: any) {
    const response = await apiRequest('POST', this.baseUrl, data);
    return response.json();
  }

  static async update(id: string, data: any) {
    const response = await apiRequest('PUT', \`\${this.baseUrl}/\${id}\`, data);
    return response.json();
  }

  static async delete(id: string) {
    const response = await apiRequest('DELETE', \`\${this.baseUrl}/\${id}\`);
    return response.json();
  }
}
EOF

        cat > "$MODULE_DIR/index.ts" << EOF
export { ${MODULE_PASCAL}Service } from './api/${MODULE_CAMEL}Service';

export const ${MODULE_CAMEL}ServiceModule = {
  name: '${MODULE_PASCAL}Service',
  version: '1.0.0',
  type: 'service'
};
EOF
        ;;
        
    "util")
        # Utility module
        cat > "$MODULE_DIR/index.ts" << EOF
/**
 * ${MODULE_PASCAL} Utility Module
 * Provides helper functions and utilities
 */

export const ${MODULE_CAMEL}Utils = {
  // Add your utility functions here
  format: (value: any): string => {
    return String(value);
  },
  
  validate: (value: any): boolean => {
    return value != null;
  },
  
  transform: (data: any): any => {
    return data;
  }
};

export default ${MODULE_CAMEL}Utils;
EOF
        ;;
esac

# Update main modules index if it exists, create if it doesn't
MODULES_INDEX="client/src/modules/index.ts"
if [ ! -f "$MODULES_INDEX" ]; then
    cat > "$MODULES_INDEX" << EOF
/**
 * 2TalkLink Modules Index
 * Auto-generated module exports
 */

EOF
fi

# Add export line for new module
echo "export * from './${MODULE_KEBAB}';" >> "$MODULES_INDEX"

echo "✅ Module '$MODULE_NAME' created successfully!"
echo "📁 Location: $MODULE_DIR"
echo "📝 Type: $MODULE_TYPE"
echo ""
echo "Usage:"
echo "  import { $MODULE_PASCAL } from '@/modules/${MODULE_KEBAB}';"
echo ""
echo "🔥 Module is ready to use without affecting existing code!"