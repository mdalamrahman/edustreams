/**
 * Code-to-UML Parser and Generator
 * Converts OOP code (Java, C++, Python) into clean PlantUML class & architecture diagrams.
 */

export function convertCodeToUml(code: string, language: 'java' | 'cpp' | 'python' = 'java', title: string = 'System Architecture'): string {
  if (!code || code.trim().length === 0) {
    return `@startuml
title ${title} — System Architecture
class SystemController
@enduml`;
  }

  const lines = code.split('\n');
  const classes: Array<{ name: string; type: 'class' | 'interface' | 'abstract class' | 'enum'; parent?: string; fields: string[]; methods: string[] }> = [];
  let currentClass: { name: string; type: 'class' | 'interface' | 'abstract class' | 'enum'; parent?: string; fields: string[]; methods: string[] } | null = null;

  const javaClassRegex = /(?:public\s+)?(abstract\s+class|class|interface|enum)\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/;
  const cppClassRegex = /(?:class|struct|enum\s+class)\s+([A-Za-z0-9_]+)(?:\s*:\s*(?:public|protected|private)\s+([A-Za-z0-9_]+))?/;
  const pythonClassRegex = /class\s+([A-Za-z0-9_]+)(?:\(([^)]+)\))?:/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*')) continue;

    // Handle single-line enums like "enum Direction { UP, DOWN, IDLE }"
    const singleLineEnumMatch = line.match(/(?:enum|enum\s+class)\s+([A-Za-z0-9_]+)\s*\{([^}]+)\}/);
    if (singleLineEnumMatch) {
      const enumName = singleLineEnumMatch[1];
      const enumItems = singleLineEnumMatch[2].split(',').map(item => item.trim()).filter(Boolean);
      classes.push({
        name: enumName,
        type: 'enum',
        fields: enumItems,
        methods: []
      });
      continue;
    }

    // Check Class/Interface/Enum header
    let match = line.match(javaClassRegex);
    if (match) {
      const kind = match[1].includes('abstract') ? 'abstract class' : match[1].includes('interface') ? 'interface' : match[1].includes('enum') ? 'enum' : 'class';
      const name = match[2];
      const parent = match[3] || (match[4] ? match[4].split(',')[0].trim() : undefined);
      currentClass = { name, type: kind as any, parent, fields: [], methods: [] };
      classes.push(currentClass);
      continue;
    }

    match = line.match(cppClassRegex);
    if (!currentClass && match) {
      currentClass = { name: match[1], type: 'class', parent: match[2], fields: [], methods: [] };
      classes.push(currentClass);
      continue;
    }

    match = line.match(pythonClassRegex);
    if (!currentClass && match) {
      currentClass = { name: match[1], type: 'class', parent: match[2] && match[2] !== 'Enum' ? match[2] : undefined, fields: [], methods: [] };
      classes.push(currentClass);
      continue;
    }

    // Extract methods and fields inside current class
    if (currentClass) {
      if (line === '}' || line.startsWith('};')) {
        currentClass = null;
        continue;
      }

      if (currentClass.type === 'enum') {
        const items = line.replace(/[{};]/g, '').split(',').map(s => s.trim()).filter(Boolean);
        for (const item of items) {
          if (item && !currentClass.fields.includes(item) && currentClass.fields.length < 8) {
            currentClass.fields.push(item);
          }
        }
      } else if (line.includes('(') && line.includes(')') && !line.startsWith('if') && !line.startsWith('for') && !line.startsWith('while') && !line.startsWith('switch')) {
        let cleanMethod = line.replace(/\{.*/, '').replace(/;/, '').trim();
        cleanMethod = cleanMethod.replace(/public\s+|private\s+|protected\s+|synchronized\s+|final\s+/g, '');
        if (cleanMethod.length > 2 && cleanMethod.length < 50 && currentClass.methods.length < 6) {
          currentClass.methods.push(cleanMethod);
        }
      } else if ((line.startsWith('private ') || line.startsWith('protected ') || line.startsWith('public ')) && line.endsWith(';')) {
        let cleanField = line.replace(';', '').trim();
        cleanField = cleanField.replace(/public\s+|private\s+|protected\s+|final\s+/g, '');
        if (cleanField.length > 1 && cleanField.length < 40 && currentClass.fields.length < 6) {
          currentClass.fields.push(cleanField);
        }
      }
    }
  }

  // Fallback if no classes detected
  if (classes.length === 0) {
    return `@startuml
title ${title} — System Architecture

class SystemController {
  + execute(): void
  + validate(): boolean
}

interface ServiceStrategy {
  + process(): void
}

class DefaultServiceStrategy implements ServiceStrategy {
  + process(): void
}

SystemController --> ServiceStrategy
@enduml`;
  }

  const puml: string[] = [
    `@startuml`,
    `title ${title} — Architecture Overview`,
    ''
  ];

  for (const c of classes) {
    puml.push(`${c.type} ${c.name} {`);
    for (const f of c.fields) {
      puml.push(`  ${c.type === 'enum' ? '' : '- '}${f}`);
    }
    for (const m of c.methods) {
      puml.push(`  + ${m}`);
    }
    puml.push('}');

    if (c.parent) {
      puml.push(`${c.parent} <|-- ${c.name}`);
    }
  }

  puml.push('@enduml');
  return puml.join('\n');
}
