/**
 * Code-to-UML Parser and Generator (v2)
 * Converts OOP code (Java, C++, Python) into clean, styled PlantUML class diagrams.
 *
 * Key fixes over v1:
 * - Brace-depth counter prevents closing `}` inside method bodies from terminating class context
 * - Separate tracking of `extends` (inheritance <|--) vs `implements` (realization ..|>)
 * - Full skinparam theme injected into every output for crystal-clear rendering
 * - Auto-detect inter-class field composition/association relationships
 * - Better method/field signature cleanup (removes throws, @annotations, etc.)
 * - Python `self.` assignment detection inside __init__
 */

/** PlantUML theme compatible with Kroki dark mode */
const UML_THEME = `
skinparam backgroundColor #0b0f19
skinparam defaultFontName "Inter", "Segoe UI", sans-serif
skinparam defaultFontSize 12
skinparam defaultFontColor #f8fafc
skinparam shadowing false
skinparam roundCorner 8
skinparam padding 4
skinparam nodesep 40
skinparam ranksep 40
skinparam linetype ortho

skinparam class {
  BackgroundColor #1e293b
  BorderColor #38bdf8
  BorderThickness 1.5
  HeaderBackgroundColor #0f172a
  FontColor #f1f5f9
  FontSize 12
  FontStyle bold
  AttributeFontColor #cbd5e1
  AttributeFontSize 11
  AttributeIconSize 0
}

skinparam interface {
  BackgroundColor #1e293b
  BorderColor #a855f7
  BorderThickness 1.5
  HeaderBackgroundColor #3b0764
  FontColor #f3e8ff
  FontSize 12
  FontStyle bold
}

skinparam enum {
  BackgroundColor #1e293b
  BorderColor #f59e0b
  BorderThickness 1.5
  HeaderBackgroundColor #1c1400
  FontColor #fef3c7
  FontSize 12
  FontStyle bold
}

skinparam package {
  BackgroundColor #0f172a
  BorderColor #475569
  BorderThickness 1.2
  FontColor #94a3b8
  FontSize 11
  FontStyle bold
}

skinparam arrow {
  Color #38bdf8
  Thickness 1.5
  FontColor #94a3b8
  FontSize 10
}
`;

interface ClassDef {
  name: string;
  type: 'class' | 'abstract class' | 'interface' | 'enum';
  /** Classes/abstract classes this type extends */
  extendsFrom: string[];
  /** Interfaces this type implements */
  implementsFrom: string[];
  fields: string[];
  methods: string[];
  /** Raw field type names (for relationship detection) */
  fieldTypes: string[];
}

/** Remove common noise from access modifiers / decorators */
function cleanVisibility(raw: string): string {
  return raw
    .replace(/@\w+(\(.*?\))?\s*/g, '') // remove Java annotations like @Override
    .replace(/\b(public|private|protected|static|final|synchronized|volatile|transient|abstract|override|virtual|inline|constexpr|explicit|friend|mutable|extern)\s+/g, '')
    .replace(/\bthrows\s+[\w,\s]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Determine PlantUML visibility prefix */
function visPrefix(line: string): string {
  if (/\bprivate\b/.test(line)) return '-';
  if (/\bprotected\b/.test(line)) return '#';
  return '+';
}

/** Extract bare type from a field declaration (strips generics, arrays, optional) */
function extractTypeName(typeStr: string): string {
  return typeStr
    .replace(/<.*>/g, '')  // remove generics
    .replace(/\[.*\]/g, '') // remove arrays
    .replace(/\?$/, '')     // remove Kotlin optional
    .split('|')[0]          // take first union type
    .trim()
    .split('.').pop() || ''; // take class name only
}

/**
 * Parse Java/Kotlin/C++ style OOP code into class definitions.
 */
function parseJavaLike(code: string): ClassDef[] {
  const classes: ClassDef[] = [];
  const lines = code.split('\n');

  let current: ClassDef | null = null;
  let depth = 0;          // brace depth overall
  let classDepth = 0;     // brace depth at which current class was opened
  let inMultilineComment = false;

  // Java/Kotlin/C# class header regex
  const classHeaderRe = /(?:@\w+\s*)*(?:public\s+|private\s+|protected\s+|internal\s+|data\s+|sealed\s+|open\s+|abstract\s+|final\s+)*\b(abstract\s+class|class|interface|enum(?:\s+class)?)\s+(\w+)\s*(?:<[^>]*>)?\s*(?:extends\s+([\w,\s<>]+?))?(?:implements\s+([\w,\s<>]+?))?\s*(?::|where\s+\w[^{]*)?\s*\{/;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Track multi-line comments
    if (inMultilineComment) {
      if (line.includes('*/')) inMultilineComment = false;
      continue;
    }
    if (line.startsWith('/*') || line.startsWith('/**')) {
      inMultilineComment = true;
      continue;
    }
    if (line.startsWith('//') || line.startsWith('#!') || !line) continue;

    // Count braces in this line for depth tracking
    const openCount = (line.match(/\{/g) || []).length;
    const closeCount = (line.match(/\}/g) || []).length;

    // Check for class/interface header BEFORE updating depth
    const classMatch = line.match(classHeaderRe);
    if (classMatch && openCount > 0) {
      // Flush current class if at same depth
      const kindRaw = classMatch[1].toLowerCase();
      const kind: ClassDef['type'] =
        kindRaw.startsWith('abstract') ? 'abstract class' :
        kindRaw === 'interface' ? 'interface' :
        kindRaw.startsWith('enum') ? 'enum' : 'class';

      const extendsStr = (classMatch[3] || '').trim();
      const implementsStr = (classMatch[4] || '').trim();

      current = {
        name: classMatch[2],
        type: kind,
        extendsFrom: extendsStr ? extendsStr.split(',').map(s => extractTypeName(s.trim())).filter(Boolean) : [],
        implementsFrom: implementsStr ? implementsStr.split(',').map(s => extractTypeName(s.trim())).filter(Boolean) : [],
        fields: [],
        methods: [],
        fieldTypes: []
      };
      classes.push(current);
      classDepth = depth; // class body opens at current depth
    }

    // Update depth after checking for class header
    depth += openCount - closeCount;

    // If depth dropped to classDepth, we've exited the class body
    if (current && depth <= classDepth && (openCount > 0 || closeCount > 0)) {
      if (depth < classDepth || (depth === classDepth && closeCount > 0)) {
        current = null;
      }
    }

    if (!current) continue;

    // We're inside a class body at depth classDepth + 1
    const bodyDepth = classDepth + 1;
    if (depth !== bodyDepth) continue; // inside method bodies — skip

    // Enum constants
    if (current.type === 'enum') {
      const enumItems = line.replace(/[{};].*$/, '').split(',').map(s => s.trim()).filter(s => /^[A-Z_][A-Z0-9_]*$/.test(s));
      for (const item of enumItems) {
        if (current.fields.length < 8 && !current.fields.includes(item)) {
          current.fields.push(item);
        }
      }
      continue;
    }

    // Method detection: has parentheses, not control flow, and is at class-body depth
    const isMethod = /\w+\s*\(/.test(line) &&
      !line.startsWith('if') && !line.startsWith('for') &&
      !line.startsWith('while') && !line.startsWith('switch') &&
      !line.startsWith('catch') && !line.startsWith('assert') &&
      !line.startsWith('return') && !line.startsWith('throw') &&
      !line.startsWith('new ') && !/=\s*new\s+/.test(line);

    if (isMethod && current.methods.length < 7) {
      const vis = visPrefix(line);
      let sig = cleanVisibility(line).replace(/\{.*$/, '').replace(/;$/, '').trim();
      // Shorten long signatures
      if (sig.length > 55) sig = sig.substring(0, 52) + '...';
      if (sig.length > 2) current.methods.push(`${vis} ${sig}`);
      continue;
    }

    // Field detection: field declaration line
    const isField = (
      /\b(private|protected|public)\b/.test(line) ||
      /\b(final|static)\s+\w+\s+\w+/.test(line)
    ) &&
      !line.includes('(') &&
      (line.endsWith(';') || line.endsWith(',') || /:/.test(line));

    if (isField && current.fields.length < 7) {
      const vis = visPrefix(line);
      let fieldClean = cleanVisibility(line).replace(/[;,]$/, '').trim();
      // Extract type for relationship detection
      const typeMatch = fieldClean.match(/^([\w<>[\],?\s]+)\s+\w+/);
      if (typeMatch) {
        const rawType = typeMatch[1].trim();
        // Check for generic collections like List<Node>, Map<String, User>
        const genericMatch = rawType.match(/<(.+)>/);
        const types = genericMatch
          ? genericMatch[1].split(',').map(s => extractTypeName(s.trim()))
          : [extractTypeName(rawType)];
        for (const t of types) {
          if (t && t.length > 1 && /^[A-Z]/.test(t) && !current.fieldTypes.includes(t)) {
            current.fieldTypes.push(t);
          }
        }
      }
      if (fieldClean.length > 2 && fieldClean.length < 50) {
        current.fields.push(`${vis} ${fieldClean}`);
      }
    }
  }

  return classes;
}

/**
 * Parse Python class definitions with `self.` field detection and super() inheritance.
 */
function parsePython(code: string): ClassDef[] {
  const classes: ClassDef[] = [];
  const lines = code.split('\n');
  let current: ClassDef | null = null;
  let inInit = false;
  let initIndent = 0;

  const classRe = /^class\s+(\w+)\s*(?:\(([^)]*)\))?:/;
  const defRe = /^(\s*)def\s+(\w+)\s*\(([^)]*)\)/;
  const selfFieldRe = /^\s+self\.(\w+)\s*=/;

  for (const rawLine of lines) {
    const classMatch = rawLine.match(classRe);
    if (classMatch) {
      const parents = classMatch[2]
        ? classMatch[2].split(',').map(s => s.trim()).filter(s => s && s !== 'object' && s !== 'ABC' && s !== 'Enum')
        : [];
      current = {
        name: classMatch[1],
        type: 'class',
        extendsFrom: parents,
        implementsFrom: [],
        fields: [],
        methods: [],
        fieldTypes: []
      };
      classes.push(current);
      inInit = false;
      continue;
    }

    if (!current) continue;

    const defMatch = rawLine.match(defRe);
    if (defMatch) {
      const methodName = defMatch[2];
      const params = defMatch[3].replace(/self,?\s*/, '').trim();
      if (methodName === '__init__') {
        inInit = true;
        initIndent = defMatch[1].length;
      } else {
        inInit = false;
        if (current.methods.length < 7) {
          const sig = params ? `${methodName}(${params})` : `${methodName}()`;
          current.methods.push(`+ ${sig}`);
        }
      }
      continue;
    }

    // Python `self.xxx = yyy` field inside __init__
    if (inInit) {
      const selfMatch = rawLine.match(selfFieldRe);
      if (selfMatch && current.fields.length < 7) {
        const fieldName = selfMatch[1];
        if (!current.fields.some(f => f.includes(fieldName))) {
          current.fields.push(`- ${fieldName}`);
        }
      }
      // If we've dedented back, exit init mode
      const indent = rawLine.match(/^(\s*)/)?.[1].length ?? 0;
      if (rawLine.trim() && indent <= initIndent && !rawLine.trim().startsWith('self')) {
        inInit = false;
      }
    }
  }

  return classes;
}

/**
 * Converts parsed class definitions into a styled PlantUML diagram string.
 */
function buildPlantUml(classes: ClassDef[], title: string): string {
  const knownClassNames = new Set(classes.map(c => c.name));
  const lines: string[] = [`@startuml`, UML_THEME, `title ${title} — Architecture Overview`, ''];

  for (const c of classes) {
    lines.push(`${c.type} ${c.name} {`);
    for (const f of c.fields) lines.push(`  ${f}`);
    if (c.fields.length > 0 && c.methods.length > 0) lines.push('  --');
    for (const m of c.methods) lines.push(`  ${m}`);
    lines.push('}');
    lines.push('');
  }

  // Relationships
  const relationships: string[] = [];
  const addedRels = new Set<string>();
  const addRel = (rel: string) => {
    if (!addedRels.has(rel)) { addedRels.add(rel); relationships.push(rel); }
  };

  for (const c of classes) {
    // extends → inheritance
    for (const parent of c.extendsFrom) {
      if (knownClassNames.has(parent)) {
        addRel(`${parent} <|-- ${c.name}`);
      }
    }
    // implements → realization
    for (const iface of c.implementsFrom) {
      if (knownClassNames.has(iface)) {
        addRel(`${iface} <|.. ${c.name}`);
      }
    }
    // Field type references → composition/association
    for (const ft of c.fieldTypes) {
      if (knownClassNames.has(ft) && ft !== c.name) {
        addRel(`${c.name} o-- ${ft}`);
      }
    }
  }

  if (relationships.length > 0) {
    lines.push('');
    lines.push("' ── Relationships ──");
    lines.push(...relationships);
  }

  lines.push('');
  lines.push('@enduml');
  return lines.join('\n');
}

/**
 * Main entry: converts OOP source code into a styled PlantUML diagram string.
 * Dispatches to language-specific parser then builds the diagram.
 */
export function convertCodeToUml(
  code: string,
  language: 'java' | 'cpp' | 'python' = 'java',
  title: string = 'System Architecture'
): string {
  if (!code || code.trim().length < 5) {
    return `@startuml\n${UML_THEME}\ntitle ${title} — System Architecture\nclass SystemController {\n  + execute(): void\n}\n@enduml`;
  }

  const classes = language === 'python' ? parsePython(code) : parseJavaLike(code);

  if (classes.length === 0) {
    return `@startuml\n${UML_THEME}\ntitle ${title} — Architecture\nnote "No class definitions detected in source code.\\nWrite a class and click Re-render." as N1\n@enduml`;
  }

  return buildPlantUml(classes, title);
}
