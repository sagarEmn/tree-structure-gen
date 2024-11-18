#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateTree(startPath, indent = '', excludes = []) {
    if (!fs.existsSync(startPath)) {
        return '';
    }

    let output = '';
    const items = fs.readdirSync(startPath);

    // Filter out excluded directories/files
    const filteredItems = items.filter(item => 
        !excludes.includes(item) && 
        !item.startsWith('.') && 
        !['node_modules', 'dist', 'build'].includes(item)
    );

    // Separate and sort directories and files
    const dirs = [];
    const files = [];
    
    filteredItems.forEach(item => {
        const itemPath = path.join(startPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
            dirs.push(item);
        } else {
            files.push(item);
        }
    });

    // Sort directories and files alphabetically
    dirs.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Process directories first
    dirs.forEach((dir, index) => {
        const itemPath = path.join(startPath, dir);
        const isLast = index === dirs.length - 1 && files.length === 0;
        
        // Add folder emoji and format
        output += `${indent}${isLast ? '└─📂' : '├─📂'} ${dir}\n`;
        
        // Calculate new indent for subdirectories
        const newIndent = indent + (isLast ? '    ' : '│   ');
        output += generateTree(itemPath, newIndent, excludes);
    });

    // Then process files
    files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        // Add file emoji based on extension
        const fileEmoji = getFileEmoji(file);
        output += `${indent}${isLast ? '└─' : '├─'}${fileEmoji} ${file}\n`;
    });

    return output;
}

function getFileEmoji(filename) {
    const ext = path.extname(filename).toLowerCase();
    const emojiMap = {
        '.js': '📜',
        '.jsx': '📜',
        '.ts': '📜',
        '.tsx': '📜',
        '.css': '📝',
        '.html': '📄',
        '.json': '📋',
        '.png': '🖼️',
        '.jpg': '🖼️',
        '.jpeg': '🖼️',
        '.gif': '🖼️',
        '.svg': '🎨',
        '.md': '📚',
        '.txt': '📝',
        '': '📄'  // default
    };
    return emojiMap[ext] || '📄';
}

function saveDirectoryTree(rootPath, excludePatterns = []) {
    try {
        // Resolve the absolute path
        const absolutePath = path.resolve(rootPath);
        
        // Generate the tree structure string
        const treeOutput = `Directory Structure for: ${absolutePath}\n${'='.repeat(50)}\n` + 
                          generateTree(absolutePath, '', excludePatterns);
        
        // Save to default file
        const outputFile = 'tree-structure.txt';
        fs.writeFileSync(outputFile, treeOutput, 'utf8');
        console.log(`✅ Directory structure has been saved to: ${outputFile}`);
        
        // Also print to console
        console.log(treeOutput);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Check if being run directly
if (require.main === module) {
    const rootPath = process.argv[2] || '.';
    const excludePatterns = process.argv.slice(3);
    
    try {
        saveDirectoryTree(rootPath, excludePatterns);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = { generateTree, saveDirectoryTree };