/**
 * @title Documentation Generation Tool for FHEVM Examples
 * @notice Automatically generates GitBook-compatible documentation from code annotations
 * @dev Extracts JSDoc/TSDoc comments and creates structured markdown documentation
 *
 * @chapter: automation
 * @category: documentation
 * @concept: doc-generation, automation
 *
 * This tool fulfills the bounty requirement for automated documentation generation
 * from code annotations in test files and contracts.
 *
 * Usage:
 * npm run generate-docs
 */

import * as fs from 'fs';
import * as path from 'path';

interface DocSection {
  chapter: string;
  category: string;
  concept: string[];
  title: string;
  description: string;
  code: string;
  file: string;
}

/**
 * @notice Main documentation generation function
 * @dev Scans test files and generates markdown documentation
 */
async function generateDocs(): Promise<void> {
  console.log('📚 Generating Documentation from Code Annotations...\n');

  const docsDir = path.join(process.cwd(), 'docs');
  const testDir = path.join(process.cwd(), 'test');

  /**
   * Ensure docs directory exists
   */
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  /**
   * Extract documentation from test files
   * @concept: code-parsing, doc-extraction
   */
  const sections: DocSection[] = [];

  if (fs.existsSync(testDir)) {
    const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.ts'));

    for (const file of testFiles) {
      const filePath = path.join(testDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const extracted = extractDocSections(content, file);
      sections.push(...extracted);
    }
  }

  console.log(`   Found ${sections.length} documented sections\n`);

  /**
   * Generate main documentation file
   * @concept: doc-generation
   */
  console.log('📝 Generating main documentation...');
  const mainDoc = generateMainDocumentation(sections);
  fs.writeFileSync(path.join(docsDir, 'README.md'), mainDoc);

  /**
   * Generate concept-based documentation
   * @concept: doc-organization
   */
  console.log('📝 Generating concept guides...');
  const concepts = groupByConceptgen(sections);

  for (const [concept, conceptSections] of Object.entries(concepts)) {
    const conceptDoc = generateConceptDocumentation(concept, conceptSections);
    const filename = `${concept.replace(/\s+/g, '-').toLowerCase()}.md`;
    fs.writeFileSync(path.join(docsDir, filename), conceptDoc);
    console.log(`   Created: ${filename}`);
  }

  /**
   * Generate chapter-based documentation
   * @concept: doc-organization
   */
  console.log('📝 Generating chapter guides...');
  const chapters = groupByChapter(sections);

  for (const [chapter, chapterSections] of Object.entries(chapters)) {
    const chapterDoc = generateChapterDocumentation(chapter, chapterSections);
    const filename = `chapter-${chapter.replace(/\s+/g, '-').toLowerCase()}.md`;
    fs.writeFileSync(path.join(docsDir, filename), chapterDoc);
    console.log(`   Created: ${filename}`);
  }

  /**
   * Generate GitBook summary
   * @concept: gitbook-integration
   */
  console.log('📝 Generating GitBook SUMMARY.md...');
  const summary = generateGitBookSummary(concepts, chapters);
  fs.writeFileSync(path.join(docsDir, 'SUMMARY.md'), summary);

  console.log('\n✅ Documentation generated successfully!');
  console.log(`   Output directory: ${docsDir}`);
}

/**
 * @notice Extract documentation sections from source code
 * @dev Parses JSDoc/TSDoc comments with special annotations
 * @param content Source code content
 * @param filename Name of the source file
 * @returns Array of extracted documentation sections
 */
function extractDocSections(content: string, filename: string): DocSection[] {
  const sections: DocSection[] = [];
  const commentPattern = /\/\*\*[\s\S]*?\*\//g;
  const comments = content.match(commentPattern) || [];

  for (const comment of comments) {
    const chapter = extractTag(comment, '@chapter');
    const category = extractTag(comment, '@category');
    const concept = extractTag(comment, '@concept');
    const title = extractTag(comment, '@title') || extractTag(comment, '@test') || extractTag(comment, '@notice');
    const description = extractDescription(comment);

    if (chapter || concept) {
      sections.push({
        chapter: chapter || 'general',
        category: category || 'uncategorized',
        concept: concept ? concept.split(',').map(c => c.trim()) : ['general'],
        title: title || 'Untitled',
        description: description,
        code: extractCodeNearComment(content, comment),
        file: filename
      });
    }
  }

  return sections;
}

/**
 * @notice Extract a specific JSDoc tag value
 */
function extractTag(comment: string, tag: string): string {
  const pattern = new RegExp(`${tag}:\\s*([^\\n\\*]+)`);
  const match = comment.match(pattern);
  return match ? match[1].trim() : '';
}

/**
 * @notice Extract description from JSDoc comment
 */
function extractDescription(comment: string): string {
  const lines = comment.split('\n')
    .map(line => line.replace(/^\s*\*\s?/, '').trim())
    .filter(line => !line.startsWith('@') && line.length > 0);

  return lines.join(' ').substring(0, 500);
}

/**
 * @notice Extract code snippet near a comment
 */
function extractCodeNearComment(content: string, comment: string): string {
  const commentIndex = content.indexOf(comment);
  if (commentIndex === -1) return '';

  const afterComment = content.substring(commentIndex + comment.length);
  const codeMatch = afterComment.match(/\n\s*(.+?)\n\s*\{[\s\S]*?\n\s*\}/);

  return codeMatch ? codeMatch[0].trim().substring(0, 300) : '';
}

/**
 * @notice Group sections by concept
 */
function groupByConceptgen(sections: DocSection[]): { [key: string]: DocSection[] } {
  const groups: { [key: string]: DocSection[] } = {};

  for (const section of sections) {
    for (const concept of section.concept) {
      if (!groups[concept]) {
        groups[concept] = [];
      }
      groups[concept].push(section);
    }
  }

  return groups;
}

/**
 * @notice Group sections by chapter
 */
function groupByChapter(sections: DocSection[]): { [key: string]: DocSection[] } {
  const groups: { [key: string]: DocSection[] } = {};

  for (const section of sections) {
    if (!groups[section.chapter]) {
      groups[section.chapter] = [];
    }
    groups[section.chapter].push(section);
  }

  return groups;
}

/**
 * @notice Generate main documentation file
 */
function generateMainDocumentation(sections: DocSection[]): string {
  let doc = `# Vaccine Record Privacy - FHEVM Example Documentation

## Overview
This documentation is automatically generated from code annotations in the test suite and demonstrates key FHEVM concepts through a privacy-preserving healthcare application.

## Features
- 🔒 Fully Homomorphic Encryption (FHE)
- 🏥 Privacy-preserving healthcare records
- 🔐 Granular access control
- ⏰ Time-based permissions
- ✅ Comprehensive test coverage

## Quick Start
\`\`\`bash
npm install
npm test
npm run deploy
\`\`\`

## Key Concepts Demonstrated
`;

  // Add concept list
  const concepts = new Set<string>();
  sections.forEach(s => s.concept.forEach(c => concepts.add(c)));

  Array.from(concepts).sort().forEach(concept => {
    doc += `\n### ${conceptToTitle(concept)}\n`;
    const conceptSections = sections.filter(s => s.concept.includes(concept));
    doc += `${conceptSections.length} examples demonstrating ${concept}\n`;
  });

  doc += `\n## Documentation Structure

See the sidebar for detailed guides organized by:
- **Concepts**: Learn specific FHEVM patterns
- **Chapters**: Follow a learning path
- **Categories**: Browse by use case

## About This Project
This project is a submission for the Zama FHEVM Bounty Program December 2025.

## License
MIT
`;

  return doc;
}

/**
 * @notice Generate concept-specific documentation
 */
function generateConceptDocumentation(concept: string, sections: DocSection[]): string {
  let doc = `# ${conceptToTitle(concept)}

## Overview
This guide demonstrates the **${concept}** pattern in FHEVM.

## Examples

`;

  sections.forEach((section, index) => {
    doc += `### ${index + 1}. ${section.title}

**Category**: ${section.category}
**Source**: ${section.file}

${section.description}

\`\`\`typescript
${section.code}
\`\`\`

---

`;
  });

  return doc;
}

/**
 * @notice Generate chapter documentation
 */
function generateChapterDocumentation(chapter: string, sections: DocSection[]): string {
  let doc = `# Chapter: ${conceptToTitle(chapter)}

## Learning Objectives
This chapter covers ${sections.length} key concepts related to ${chapter}.

## Sections

`;

  sections.forEach((section, index) => {
    doc += `## ${index + 1}. ${section.title}

${section.description}

**Concepts**: ${section.concept.join(', ')}

\`\`\`typescript
${section.code}
\`\`\`

---

`;
  });

  return doc;
}

/**
 * @notice Generate GitBook SUMMARY.md
 */
function generateGitBookSummary(
  concepts: { [key: string]: DocSection[] },
  chapters: { [key: string]: DocSection[] }
): string {
  let summary = `# Summary

* [Introduction](README.md)

## By Concept

`;

  Object.keys(concepts).sort().forEach(concept => {
    const filename = `${concept.replace(/\s+/g, '-').toLowerCase()}.md`;
    summary += `* [${conceptToTitle(concept)}](${filename})\n`;
  });

  summary += `\n## By Chapter\n\n`;

  Object.keys(chapters).sort().forEach(chapter => {
    const filename = `chapter-${chapter.replace(/\s+/g, '-').toLowerCase()}.md`;
    summary += `* [${conceptToTitle(chapter)}](${filename})\n`;
  });

  return summary;
}

/**
 * @notice Convert concept slug to title
 */
function conceptToTitle(concept: string): string {
  return concept
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Execute documentation generation with error handling
 */
if (require.main === module) {
  generateDocs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Documentation generation failed:');
      console.error(error);
      process.exit(1);
    });
}

export { generateDocs };
