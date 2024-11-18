#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function generateTree(startPath, indent = "", excludes = []) {
  if (!fs.existsSync(startPath)) {
    return "";
  }

  let output = "";
  const items = fs.readdirSync(startPath);

  // Filter out excluded directories/files
  const filteredItems = items.filter(
    (item) =>
      !excludes.includes(item) &&
      !item.startsWith(".") &&
      !["node_modules", "dist", "build"].includes(item)
  );

  // Separate and sort directories and files
  const dirs = [];
  const files = [];

  filteredItems.forEach((item) => {
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
    output += `${indent}${isLast ? "┗" : "┣"} 📂${dir}\n`;
    const newIndent = indent + (isLast ? " " : "┃") + " ";
    output += generateTree(itemPath, newIndent, excludes);
  });

  // Then process files
  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    output += `${indent}${isLast ? "┗" : "┣"} 📜${file}\n`;
  });

  return output;
}

function saveDirectoryTree(rootPath, excludePatterns = []) {
  try {
    const absolutePath = path.resolve(rootPath);
    // Removed the space before the tree structure
    const treeOutput =
      `📦${path.basename(absolutePath)}\n` +
      generateTree(absolutePath, "", excludePatterns);

    const outputFile = "tree-structure.txt";
    fs.writeFileSync(outputFile, treeOutput, "utf8");
    console.log(`✅ Directory structure has been saved to: ${outputFile}`);

    // Also print to console
    console.log(treeOutput);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Check if being run directly
if (require.main === module) {
  const rootPath = process.argv[2] || ".";
  const excludePatterns = process.argv.slice(3);

  try {
    saveDirectoryTree(rootPath, excludePatterns);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

module.exports = { generateTree, saveDirectoryTree };
