#!/usr/bin/env node

/**
 * Auto Migration Generator
 * Automatically generates migrations from model files
 * 
 * Usage:
 * node scripts/auto-generate-migrations.js
 */

const fs = require('fs');
const path = require('path');

// Model to table mapping and SQL type conversion
const typeMapping = {
  'string': 'TEXT',
  'number': 'INTEGER',
  'boolean': 'BOOLEAN',
  'date': 'DATETIME'
};

// Get model files from models directory
function getModelFiles() {
  const modelsDir = path.join(__dirname, '..', 'src', 'models');
  
  if (!fs.existsSync(modelsDir)) {
    console.error('❌ Models directory not found');
    return [];
  }

  return fs.readdirSync(modelsDir)
    .filter(file => 
      file.endsWith('.js') && 
      file !== 'BaseModel.js' && 
      file !== 'index.js' &&
      !file.includes('test') &&
      !file.includes('spec')
    )
    .map(file => {
      // Handle different naming conventions
      let name = file.replace('.js', '');
      
      // Convert PascalCase to snake_case for table names
      // Users -> user, MentorProfile -> mentor_profile, etc.
      if (name === 'Users') {
        name = 'user';
      } else if (name === 'MentorProfile') {
        name = 'mentor_profile';
      } else if (name === 'MenteeProfile') {
        name = 'mentee_profile';
      } else if (name === 'Messages') {
        name = 'message';
      } else if (name === 'Sessions') {
        name = 'session';
      } else {
        // Convert PascalCase to snake_case
        name = name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      }
      
      return {
        file,
        name,
        path: path.join(modelsDir, file)
      };
    });
}

// Parse model file to extract properties
function parseModelFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const properties = [];
    
    // Extract class name
    const classMatch = content.match(/export class (\w+)|class (\w+)/);
    const className = classMatch ? (classMatch[1] || classMatch[2]) : null;
    
    if (!className) {
      console.log(`   ⚠️  No class found in ${path.basename(filePath)}`);
      return properties;
    }
    
    // Extract properties from constructor
    const constructorMatch = content.match(/constructor\(data = \{\}\) \{([\s\S]*?)\n  \}/);
    if (!constructorMatch) {
      console.log(`   ⚠️  No constructor found in ${className}`);
      return properties;
    }
    
    const constructorBody = constructorMatch[1];
    const propertyLines = constructorBody.split('\n');
    
    propertyLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('this.')) {
        const match = trimmed.match(/this\.(\w+)\s*=\s*data\.(\w+)\s*\|\|\s*(.+);/);
        if (match) {
          const [, propName, , defaultValue] = match;
          let sqlType = 'TEXT';
          let constraints = [];
          
          // Determine SQL type from default value or comments
          if (defaultValue === 'null' || defaultValue === 'undefined') {
            // Check for specific field names
            if (propName === 'id') {
              sqlType = 'INTEGER';
              constraints.push('PRIMARY KEY AUTOINCREMENT');
            } else if (propName.includes('_at')) {
              sqlType = 'DATETIME';
            }
          } else if (defaultValue === 'false' || defaultValue === 'true') {
            sqlType = 'BOOLEAN';
            constraints.push(`DEFAULT ${defaultValue === 'true' ? '1' : '0'}`);
          } else if (!isNaN(defaultValue)) {
            sqlType = 'INTEGER';
            constraints.push(`DEFAULT ${defaultValue}`);
          } else if (defaultValue.includes("'")) {
            sqlType = 'TEXT';
            if (defaultValue !== "''") {
              constraints.push(`DEFAULT ${defaultValue}`);
            }
          }
          
          // Add NOT NULL for required fields
          if (propName === 'email' || propName === 'name' || propName === 'user_type') {
            constraints.push('NOT NULL');
          }
          
          // Add UNIQUE constraint for email
          if (propName === 'email') {
            constraints.push('UNIQUE');
          }
          
          // Add CHECK constraints for enums (from comments)
          if (line.includes('//') && line.includes("'")) {
            const comment = line.split('//')[1];
            if (comment.includes("'")) {
              const values = comment.match(/'[^']+'/g);
              if (values && values.length > 1) {
                const enumValues = values.join(', ');
                constraints.push(`CHECK (${propName} IN (${enumValues}))`);
              }
            }
          }
          
          properties.push({
            name: propName,
            type: sqlType,
            constraints: constraints.join(' ')
          });
        }
      }
    });
    
    return properties;
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error.message);
    return [];
  }
}

// Get next migration number
function getNextMigrationNumber() {
  const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    return '001';
  }

  const existingFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^\d{3}_.*\.js$/))
    .sort();

  let nextNumber = 1;
  if (existingFiles.length > 0) {
    const lastFile = existingFiles[existingFiles.length - 1];
    const lastNumber = parseInt(lastFile.substring(0, 3));
    nextNumber = lastNumber + 1;
  }

  return String(nextNumber).padStart(3, '0');
}

// Generate combined migration content
function generateCombinedMigration(modelsData) {
  const migrationNumber = getNextMigrationNumber();
  
  // Generate table creation statements
  const tableStatements = [];
  const indexStatements = [];
  const dropStatements = [];
  
  modelsData.forEach(({ model, properties }) => {
    // Get table name
    let tableName;
    if (model.name === 'user') {
      tableName = 'users';
    } else if (model.name === 'mentor_profile') {
      tableName = 'mentor_profiles';
    } else if (model.name === 'mentee_profile') {
      tableName = 'mentee_profiles';
    } else if (model.name === 'message') {
      tableName = 'messages';
    } else if (model.name === 'session') {
      tableName = 'sessions';
    } else {
      tableName = model.name + 's';
    }
    
    // Generate columns
    const columns = properties.map(prop => {
      return `      ${prop.name} ${prop.type}${prop.constraints ? ' ' + prop.constraints : ''}`;
    }).join(',\n');
    
    // Create table statement
    tableStatements.push(`    CREATE TABLE IF NOT EXISTS ${tableName} (
${columns}
    );`);
    
    // Generate indexes for this table
    const tableIndexes = properties
      .filter(prop => prop.name === 'email' || prop.name.includes('_id') || prop.name === 'user_type' || prop.name === 'status')
      .map(prop => `    CREATE INDEX IF NOT EXISTS idx_${tableName}_${prop.name} ON ${tableName}(${prop.name});`);
    
    if (tableIndexes.length > 0) {
      indexStatements.push(...tableIndexes);
    }
    
    // Drop statement (reverse order for foreign key constraints)
    dropStatements.unshift(`    DROP TABLE IF EXISTS ${tableName};`);
  });
  
  // Combine all statements
  const upStatements = [
    ...tableStatements,
    '',
    '    -- Create indexes',
    ...indexStatements
  ].join('\n');
  
  const downStatements = [
    '    -- Drop indexes (they will be dropped with tables)',
    ...dropStatements
  ].join('\n');
  
  return `export const createAllTables = {
  name: '${migrationNumber}_create_all_tables',
  up: \`
${upStatements}
  \`,
  down: \`
${downStatements}
  \`
};
`;
}

// Main function
function main() {
  console.log('🚀 Auto-generating single combined migration from models...\n');
  
  const modelFiles = getModelFiles();
  
  if (modelFiles.length === 0) {
    console.log('❌ No model files found');
    return;
  }
  
  console.log(`📊 Found ${modelFiles.length} model files:`);
  modelFiles.forEach(model => {
    console.log(`   - ${model.file} → ${model.name}_table`);
  });
  console.log('');
  
  const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');
  const modelsData = [];
  
  // Process all models first
  modelFiles.forEach(model => {
    console.log(`📄 Processing ${model.file}...`);
    
    const properties = parseModelFile(model.path);
    
    if (properties.length === 0) {
      console.log(`   ⚠️  No properties found in ${model.file}`);
      return;
    }
    
    modelsData.push({ model, properties });
    console.log(`   ✅ Found ${properties.length} properties`);
  });
  
  if (modelsData.length === 0) {
    console.log('❌ No valid models found');
    return;
  }
  
  // Generate single combined migration
  const migrationContent = generateCombinedMigration(modelsData);
  const migrationNumber = getNextMigrationNumber();
  const fileName = `${migrationNumber}_create_all_tables.js`;
  const filePath = path.join(migrationsDir, fileName);
  
  try {
    fs.writeFileSync(filePath, migrationContent);
    console.log(`\n✅ Created combined migration: ${fileName}`);
    
    // Update migrations index
    updateMigrationsIndex([{
      fileName: fileName.replace('.js', ''),
      exportName: 'createAllTables'
    }]);
    
    console.log(`\n🎉 Generated 1 combined migration with ${modelsData.length} tables!`);
    console.log('\nTables included:');
    modelsData.forEach(({ model }) => {
      let tableName = model.name === 'user' ? 'users' : 
                     model.name === 'mentor_profile' ? 'mentor_profiles' :
                     model.name === 'mentee_profile' ? 'mentee_profiles' :
                     model.name === 'message' ? 'messages' :
                     model.name === 'session' ? 'sessions' : 
                     model.name + 's';
      console.log(`   - ${tableName}`);
    });
    
    console.log('\nNext steps:');
    console.log('1. Review the generated migration file');
    console.log('2. Run your app to apply the migration');
    console.log('3. All tables will be created in proper order');
    
  } catch (error) {
    console.error(`❌ Failed to create migration:`, error.message);
  }
}

// Update migrations index file
function updateMigrationsIndex(newMigrations) {
  const indexPath = path.join(__dirname, '..', 'src', 'database', 'migrations', 'index.js');
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add imports
    const imports = newMigrations.map(m => 
      `import { ${m.exportName} } from './${m.fileName}';`
    ).join('\n');
    
    // Add to migrations array
    const exports = newMigrations.map(m => `  ${m.exportName},`).join('\n');
    
    // Insert imports after existing imports
    const importInsertPoint = content.indexOf('export const migrations');
    const beforeImports = content.substring(0, importInsertPoint);
    const afterImports = content.substring(importInsertPoint);
    
    // Update migrations array
    const updatedContent = beforeImports + imports + '\n\n' + afterImports.replace(
      'export const migrations = [',
      `export const migrations = [\n${exports}`
    );
    
    fs.writeFileSync(indexPath, updatedContent);
    console.log('   ✅ Updated migrations/index.js');
  } catch (error) {
    console.log('   ⚠️  Could not auto-update index.js, please add manually');
  }
}

main();
