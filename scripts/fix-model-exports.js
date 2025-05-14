/**
 * This script fixes Mongoose model declarations to prevent "OverwriteModelError"
 * during Next.js hot reloading by modifying the export pattern in all model files.
 */

const fs = require('fs');
const path = require('path');

// Path to models directory
const modelsDir = path.join(__dirname, '..', 'lib', 'models');

// Function to fix a model file
function fixModelFile(filePath) {
  console.log(`Processing: ${path.basename(filePath)}`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if it's the index file or already fixed
  if (filePath.endsWith('index.ts') || content.includes('try {') && content.includes('mongoose.model<')) {
    console.log(`Skipping ${path.basename(filePath)} (already fixed or index file)`);
    return;
  }
  
  // Extract model name from the content
  const modelNameMatch = content.match(/mongoose\.model<\w+>\('(\w+)'/) || 
                        content.match(/model\(['"](\w+)["']/) ||
                        content.match(/model<\w+>\(['"](\w+)["']/);
  
  if (!modelNameMatch) {
    console.log(`Could not extract model name from ${path.basename(filePath)}, skipping`);
    return;
  }
  
  const modelName = modelNameMatch[1];
  
  // Extract interface name
  const interfaceMatch = content.match(/interface (\w+)/) || content.match(/mongoose\.model<(\w+)>/);
  const interfaceName = interfaceMatch ? interfaceMatch[1] : `I${modelName}`;
  
  // Check if the file has a Schema declaration
  const hasSchema = content.includes('new Schema(') || content.includes('new mongoose.Schema(');
  const schemaVarMatch = content.match(/const\s+(\w+Schema)\s*:/);
  const schemaVarName = schemaVarMatch ? schemaVarMatch[1] : `${modelName}Schema`;
  
  // Create the new model export pattern
  const newModelExport = `
// Export model - prevent overwrite errors with models check
let ${modelName}: Model<${interfaceName}>;
try {
  // Try to use existing model first
  ${modelName} = mongoose.model<${interfaceName}>('${modelName}');
} catch {
  // Create new model if it doesn't exist
  ${modelName} = mongoose.model<${interfaceName}>('${modelName}', ${schemaVarName});
}

export default ${modelName};`;
  
  // Check if Model is imported
  if (!content.includes('Model } from')) {
    content = content.replace(/import mongoose, \{ Schema, Document/g, 'import mongoose, { Schema, Document, Model');
    content = content.replace(/import mongoose, \{/g, 'import mongoose, { Model,');
    content = content.replace(/import \{ Schema,/g, 'import { Schema, Model,');
  }
  
  // Replace the export with our new pattern
  const exportRegex = /export default mongoose\.model<\w+>\([^)]+\);/;
  
  if (exportRegex.test(content)) {
    content = content.replace(exportRegex, newModelExport);
  } else {
    // If we can't find the exact pattern, try to add it at the end of the file
    content = content.trim() + '\n' + newModelExport + '\n';
  }
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed model export in ${path.basename(filePath)}`);
}

// Process all TypeScript files in the models directory
try {
  const files = fs.readdirSync(modelsDir);
  
  // Filter for TypeScript files that aren't the index.ts
  const modelFiles = files.filter(file => 
    (file.endsWith('.ts') || file.endsWith('.js')) && 
    file !== 'index.ts' && 
    file !== 'index.js' && 
    file !== 'preload-models.ts'
  );
  
  console.log(`Found ${modelFiles.length} model files to process`);
  
  // Process each file
  modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    fixModelFile(filePath);
  });
  
  console.log('✅ All model files processed successfully');
} catch (error) {
  console.error('Error processing model files:', error);
} 