const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

// New flag to determine output configuration
const outputFlag = process.argv[2] || 'auth'; // Default to 'auth' if no argument is provided

let outputFile, rolesOnly, outputLines;

// New array for points-specific files
const pointsFiles = [
  'prisma/schema.prisma',
  'components/shared/Header.tsx',
  'app/tutorials/[tutorialId]/page.tsx',
  'app/dashboard/page.tsx',
  'types/next-auth.d.ts',
  'app/api/points/route.ts',
  'app/api/auth/[...nextauth]/route.ts',
  //'components/shared/MiniChallenge.tsx',
  'components/shared/Quiz.tsx',
  'app/api/viewedSolutions/route.ts',
  'app/api/leaderboard/route.ts',
  'app/leaderboard/page.tsx',
];

switch (outputFlag) {
  case 'auth':
    outputFile = 'authStruct.js';
    rolesOnly = true;
    outputLines = 0;
    break;
  case 'struct':
    outputFile = 'setupStruct.js';
    rolesOnly = false;
    outputLines = 2;
    break;
  case 'full':
    outputFile = 'setup.js';
    rolesOnly = false;
    outputLines = 0;
    break;
  case 'all':
    // 'all' case will be handled separately
    break;
  case 'points':
    outputFile = 'pointsStruct.js';
    rolesOnly = true;
    outputLines = 0;
    break;
  default:
    console.error('Invalid flag. Use "auth", "struct", "full", "all", or "points".');
    process.exit(1);
}

// Arrays for ignore list and full output files
const ignoreList = [
  'node_modules',
  'public',
  '.git',
  'prisma/dev.db',
  '.next',
  'scan.js',
  'setup.js',
  'generate.js',
  'structure.js',
  'ignore.js',
  'PROJECT.MD',
  'README.MD',
  'package-lock.json',
  'tsconfig.tsbuildinfo',
];

const fullOutputFiles = [
  '.env',
  'package.json',
  'tsconfig.json',
  'server.js',
];

const specificFiles = [
  'app/api/auth/[...nextauth]/route.ts',
  'components/shared/Header.tsx',
  'components/NextAuthProvider.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx',
  'middleware.ts',
  'prisma/schema.prisma',
  'app/Providers.tsx',
  '.env',
  'app/layout.tsx',
  'tsconfig.json',
  'app/dashboard/page.tsx',
  'prisma.ts',
];

function shouldInclude(filePath) {
  if (rolesOnly) {
    const normalizedFilePath = path.normalize(filePath).replace(/\\/g, '/').toLowerCase();
    if (outputFlag === 'points') {
      return pointsFiles.some(specificPath => 
        normalizedFilePath === specificPath.toLowerCase()
      );
    }
    return specificFiles.some(specificPath => 
      normalizedFilePath === specificPath.toLowerCase()
    );
  }
  return !shouldIgnore(filePath);
}

function shouldIgnore(filePath) {
  return ignoreList.some(item => {
    const fullPath = path.join(projectRoot, item);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        return filePath.startsWith(item);
      } else {
        return filePath === item;
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      console.error(`Error checking ${fullPath}:`, error);
      return false;
    }
  });
}

function isTextFile(buffer) {
  const textChars = buffer.toString().replace(/[\r\n]/g, '');
  const nonPrintable = textChars.replace(/[ -~]/g, '');
  return nonPrintable.length / textChars.length < 0.1;
}

function scanDirectory(dir) {
  let files = {};

  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');

    if (fs.statSync(fullPath).isDirectory()) {
      Object.assign(files, scanDirectory(fullPath));
    } else if (shouldInclude(relativePath)) {
      const buffer = fs.readFileSync(fullPath);
      const isText = isTextFile(buffer);
      files[relativePath] = {
        content: isText ? buffer.toString('utf8') : buffer.toString('base64'),
        encoding: isText ? 'utf8' : 'base64'
      };
    }
  });

  return files;
}

function generateSetupScript(files) {
  let script = `// Auto-generated setup script\n\n`;
  script += `const fs = require('fs');\n`;
  script += `const path = require('path');\n\n`;
  script += `exports.files = {\n`;

  for (const [filePath, fileInfo] of Object.entries(files)) {
    script += `  // ${filePath}\n`;
    script += `  '${filePath}': {\n`;
    
    let contentLines = fileInfo.content.split('\n');
    let trimmedContent = '';
    
    if (fullOutputFiles.includes(filePath) || (rolesOnly && specificFiles.includes(filePath)) || outputLines === 0) {
      trimmedContent = fileInfo.content;
    } else {
      let lineCount = 0;
      let importEnded = false;

      for (const line of contentLines) {
        if (lineCount < outputLines || !importEnded) {
          trimmedContent += line + '\n';
          lineCount++;

          if (lineCount >= outputLines && !line.trim().startsWith('import') && !line.trim().startsWith('from')) {
            importEnded = true;
          }
        } else {
          break;
        }
      }

      if (contentLines.length > lineCount) {
        trimmedContent += '    // ... rest of the file content ...\n';
      }
    }

    script += `    content: \`${trimmedContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,\n`;
    script += `    encoding: '${fileInfo.encoding}'\n`;
    script += `  },\n\n`;
  }

  script += `};\n\n`;
  script += `exports.writeFiles = function() {\n`;
  script += `  Object.entries(this.files).forEach(([filePath, fileInfo]) => {\n`;
  script += `    const dir = path.dirname(filePath);\n`;
  script += `    if (!fs.existsSync(dir)) {\n`;
  script += `      fs.mkdirSync(dir, { recursive: true });\n`;
  script += `    }\n`;
  script += `    const content = fileInfo.encoding === 'base64' ? Buffer.from(fileInfo.content, 'base64') : fileInfo.content;\n`;
  script += `    fs.writeFileSync(filePath, content, fileInfo.encoding === 'base64' ? null : 'utf8');\n`;
  script += `    console.log(\`Created: \${filePath}\`);\n`;
  script += `  });\n`;
  script += `};\n`;

  return script;
}

function writeSetupScript(script, filename) {
  fs.writeFileSync(filename, script, 'utf8');
  console.log(`Setup script has been written to ${filename}`);
}

if (outputFlag === 'all') {
  const configurations = [
    { file: 'authStruct.js', rolesOnly: true, outputLines: 0 },
    { file: 'setupStruct.js', rolesOnly: false, outputLines: 2 },
    { file: 'setup.js', rolesOnly: false, outputLines: 0 },
    { file: 'pointsStruct.js', rolesOnly: true, outputLines: 0 }
  ];

  configurations.forEach(config => {
    outputFile = config.file;
    rolesOnly = config.rolesOnly;
    outputLines = config.outputLines;

    const scannedFiles = scanDirectory(projectRoot);
    const setupScript = generateSetupScript(scannedFiles);
    writeSetupScript(setupScript, outputFile);
  });
} else {
  const scannedFiles = scanDirectory(projectRoot);
  const setupScript = generateSetupScript(scannedFiles);
  writeSetupScript(setupScript, outputFile);
}