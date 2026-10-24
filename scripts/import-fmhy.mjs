/**
 * ============================================================================
 * FMHY TOOL IMPORTER SCRIPT (COMPLETE WIKI & TOOLS HIERARCHY)
 * ============================================================================
 * Fetches curated tools from both the "Wiki" categories and the "Tools" categories
 * from FMHY's official GitHub repository and structures them cleanly in src/data/tools.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. WIKI CATEGORIES
const wikiFiles = [
  { file: 'privacy.md', category: 'Adblocking / Privacy', limit: 15 },
  { file: 'ai.md', category: 'Artificial Intelligence', limit: 20 },
  { file: 'video.md', category: 'Movies / TV / Anime', limit: 15 },
  { file: 'audio.md', category: 'Music / Podcasts / Radio', limit: 15 },
  { file: 'gaming.md', category: 'Gaming / Emulation', limit: 15 },
  { file: 'reading.md', category: 'Books / Comics / Manga', limit: 15 },
  { file: 'downloading.md', category: 'Downloading', limit: 12 },
  { file: 'torrenting.md', category: 'Torrenting', limit: 12 },
  { file: 'educational.md', category: 'Educational', limit: 15 },
  { file: 'mobile.md', category: 'Android / iOS', limit: 12 },
  { file: 'linux-macos.md', category: 'Linux / macOS', limit: 15 }
];

// 2. TOOLS CATEGORIES
const toolsFiles = [
  { file: 'system-tools.md', category: 'System Tools', limit: 15 },
  { file: 'file-tools.md', category: 'File Tools', limit: 15 },
  { file: 'internet-tools.md', category: 'Internet Tools', limit: 15 },
  { file: 'social-media-tools.md', category: 'Social Media Tools', limit: 12 },
  { file: 'text-tools.md', category: 'Text Tools', limit: 12 },
  { file: 'gaming-tools.md', category: 'Gaming Tools', limit: 12 },
  { file: 'image-tools.md', category: 'Image Tools', limit: 15 },
  { file: 'video-tools.md', category: 'Video Tools', limit: 15 },
  { file: 'developer-tools.md', category: 'Developer Tools', limit: 20 }
];

async function fetchCategoryList(list, sectionName) {
  const result = [];
  const seenUrls = new Set();

  for (const item of list) {
    const rawUrl = `https://raw.githubusercontent.com/fmhy/edit/main/docs/${item.file}`;
    try {
      const response = await fetch(rawUrl);
      if (!response.ok) continue;

      const text = await response.text();
      const lines = text.split('\n');
      let count = 0;

      for (const line of lines) {
        if (!line.startsWith('*')) continue;

        const isStarred = line.includes('⭐');
        const dashIndex = line.indexOf(' - ');
        const beforeDash = dashIndex !== -1 ? line.slice(0, dashIndex) : line;
        let desc = dashIndex !== -1 ? line.slice(dashIndex + 3).trim() : '';

        // Extract markdown links before the dash
        const linkMatches = [...beforeDash.matchAll(/\[([^[\]]+)\]\((https?:\/\/[^)\s]+)\)/g)];
        if (linkMatches.length === 0) continue;

        const primaryName = linkMatches[0][1].trim();
        const primaryUrl = linkMatches[0][2].trim();

        if (primaryUrl.includes('reddit.com/r/FREEMEDIAHECKYEAH') || primaryUrl.includes('fmhy.net')) continue;
        if (seenUrls.has(primaryUrl)) continue;
        seenUrls.add(primaryUrl);

        let cleanName = primaryName;
        const companions = linkMatches.slice(1)
          .map(m => m[1].trim())
          .filter(n => !['2', '3', 'GitHub', 'Discord', 'Reddit', 'Subreddit', 'Instances', 'Web Version', 'Add Features', 'Limits', 'Resources', 'Learning', 'Usage Tracker', 'X'].includes(n));

        if (companions.length > 0) {
          cleanName += ' / ' + companions.join(' / ');
        }

        desc = desc
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/[*_~`]/g, '')
          .replace(/\s*\/\s*$/, '')
          .trim();

        if (desc.length > 200) desc = desc.slice(0, 197) + '...';

        result.push({
          name: cleanName,
          url: primaryUrl,
          category: item.category,
          section: sectionName,
          pricing: isStarred ? '⭐ Top Pick' : 'Free / Open Source',
          description: desc || 'Curated community resource and utility.'
        });

        count++;
        if (count >= item.limit) break;
      }
      console.log(`✓ [${sectionName}] Loaded ${count} tools from ${item.category}`);
    } catch (err) {
      console.error(`Error fetching ${item.category}:`, err.message);
    }
  }
  return result;
}

async function runImporter() {
  console.log('Fetching full FMHY hierarchy (Wiki + Tools)...');
  const wikiTools = await fetchCategoryList(wikiFiles, 'Wiki');
  const utilityTools = await fetchCategoryList(toolsFiles, 'Tools');
  
  const allTools = [...wikiTools, ...utilityTools];
  const outputPath = path.resolve(__dirname, '../src/data/tools.json');
  fs.writeFileSync(outputPath, JSON.stringify(allTools, null, 2), 'utf8');

  console.log(`\n🎉 Success! Wrote ${allTools.length} total tools (${wikiTools.length} Wiki, ${utilityTools.length} Tools) to: ${outputPath}`);
}

runImporter();
