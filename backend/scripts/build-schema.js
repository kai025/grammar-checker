const fs = require("fs");
const path = require("path");

// Function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return "";
  }
}

// Function to write file content
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Successfully wrote ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
  }
}

// Main function to build schema
function buildSchema() {
  console.log("🔨 Building Prisma schema from separate files...");

  const prismaDir = path.join(__dirname, "..", "prisma");
  const outputFile = path.join(prismaDir, "schema.prisma");

  // Read the base schema (generator and datasource)
  const baseSchema = readFile(path.join(prismaDir, "base.prisma"));

  // Read enums
  const enums = readFile(path.join(prismaDir, "enums.prisma"));

  // Read model files
  const coreModels = readFile(path.join(prismaDir, "models", "core.prisma"));
  const grammarModels = readFile(
    path.join(prismaDir, "models", "grammar.prisma")
  );

  // Combine all parts
  const combinedSchema = [
    "// =============================================================================",
    "// AUTO-GENERATED SCHEMA - DO NOT EDIT DIRECTLY",
    "// This file is generated from separate schema files.",
    "// Edit the individual files in prisma/models/ and prisma/enums.prisma",
    "// =============================================================================",
    "",
    baseSchema,
    "",
    "// =============================================================================",
    "// ENUMS",
    "// =============================================================================",
    "",
    enums,
    "",
    "// =============================================================================",
    "// MODELS",
    "// =============================================================================",
    "",
    coreModels,
    "",
    grammarModels,
    "",
  ].join("\n");

  // Write the combined schema
  writeFile(outputFile, combinedSchema);

  console.log("🎉 Schema build completed!");
}

// Run the build
buildSchema();
