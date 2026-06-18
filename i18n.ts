// i18n.ts — TXT Exporter 多语言支持
// 根据 Obsidian 语言设置自动切换界面字符串
// 支持：zh / en / ja / ko / de / fr / es / pt / ar / it / th / vi
// 未匹配 → 默认英文

import { getLanguage } from 'obsidian';

export type Locale =
  | 'zh' | 'en' | 'ja' | 'ko' | 'de' | 'fr'
  | 'es' | 'pt' | 'it' | 'th' | 'vi';

const SUPPORTED: Locale[] = [
  'zh', 'en', 'ja', 'ko', 'de', 'fr',
  'es', 'pt', 'it', 'th', 'vi',
];

// Obsidian 返回形如 'zh-cn' / 'en' / 'pt-br'，截前缀标准化
export function normalizeLocale(lang: string): Locale {
  const lower = lang.toLowerCase();
  for (const l of SUPPORTED) {
    if (lower === l || lower.startsWith(l + '-')) return l;
  }
  return 'en';
}

// var 替换：阿拉伯语里的 LRM 由翻译文件手写控制，这里只做简单替换
function wrapVars(s: string, vars: Record<string, string | number> | undefined): string {
  if (!vars) return s;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export class I18n {
  readonly locale: Locale;

  constructor() {
    this.locale = normalizeLocale(getLanguage());
  }

  t(key: string, vars?: Record<string, string | number>): string {
    const table = STRINGS[this.locale] ?? STRINGS.en;
    let s = table[key] ?? STRINGS.en[key] ?? key;
    return wrapVars(s, vars);
  }
}

// ============ 翻译表 ============
// 占位符：{name} {count} {folder} {suffix}

const STRINGS: Record<Locale, Record<string, string>> = {

  zh: {
    'menu.title': '导出为 TXT',
    'notice.exportedFile': '已导出：{name}',
    'notice.exportedFolder': '已导出 {count} 个文件 → {folder}{suffix}',
    'suffix.preserveHierarchy': '（保留层级）',
    'settings.header': '配置导出 txt 时的内容处理。右键文件/文件夹即可触发导出。',
    'settings.stripFrontmatter.name': '去除 frontmatter',
    'settings.stripFrontmatter.desc': '导出时移除 YAML 头部元数据（--- ... ---）',
    'settings.stripMarkdown.name': '去除 markdown 标记',
    'settings.stripMarkdown.desc': '去掉 # 标题、**粗体**、[]() 链接等格式符号',
    'settings.compact.name': '段间无空行（紧凑）',
    'settings.compact.desc': '段落之间不留空行，每个段落单独一行',
    'settings.preserveHierarchy.name': '保留目录层级',
    'settings.preserveHierarchy.desc': '打开后保留原 vault 的子目录结构（默认所有笔记平铺到同名子目录）',
    'dialog.conflictSingle': '{name} 已存在',
    'dialog.conflictMultiple': '目标文件夹已包含 {count} 个同名文件',
    'dialog.overwrite': '覆盖',
    'dialog.skip': '跳过',
    'dialog.cancel': '取消',
  },

  en: {
    'menu.title': 'Export to TXT',
    'notice.exportedFile': 'Exported: {name}',
    'notice.exportedFolder': 'Exported {count} files → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (hierarchy preserved)',
    'settings.header': 'Configure how notes are processed when exported as TXT. Right-click a file or folder to export.',
    'settings.stripFrontmatter.name': 'Strip frontmatter',
    'settings.stripFrontmatter.desc': 'Remove YAML frontmatter (--- ... ---) when exporting.',
    'settings.stripMarkdown.name': 'Strip markdown',
    'settings.stripMarkdown.desc': 'Remove # headings, **bold**, []() links and other formatting symbols.',
    'settings.compact.name': 'Compact (no blank lines)',
    'settings.compact.desc': 'Collapse blank lines between paragraphs; one paragraph per line.',
    'settings.preserveHierarchy.name': 'Preserve directory hierarchy',
    'settings.preserveHierarchy.desc': "Preserve the vault's subdirectory structure on export (default: flatten all notes into the same-name subfolder).",
    'dialog.conflictSingle': '{name} already exists',
    'dialog.conflictMultiple': 'Destination folder already contains {count} files with the same name',
    'dialog.overwrite': 'Overwrite',
    'dialog.skip': 'Skip',
    'dialog.cancel': 'Cancel',
  },

  ja: {
    'menu.title': 'TXT としてエクスポート',
    'notice.exportedFile': 'エクスポートしました：{name}',
    'notice.exportedFolder': '{count} 個のファイルをエクスポートしました → {folder}{suffix}',
    'suffix.preserveHierarchy': '（階層保持）',
    'settings.header': 'TXT エクスポート時のコンテンツ処理を構成します。ファイルまたはフォルダを右クリックしてエクスポートします。',
    'settings.stripFrontmatter.name': 'フロントマターを除去',
    'settings.stripFrontmatter.desc': 'エクスポート時に YAML フロントマター（--- ... ---）を削除します。',
    'settings.stripMarkdown.name': 'Markdown 記号を除去',
    'settings.stripMarkdown.desc': '# 見出し、**太字**、[]() リンクなどの書式記号を削除します。',
    'settings.compact.name': '段落間に空行なし（コンパクト）',
    'settings.compact.desc': '段落間の空行を取り除き、1 段落 1 行にまとめます。',
    'settings.preserveHierarchy.name': 'ディレクトリ階層を保持',
    'settings.preserveHierarchy.desc': 'エクスポート時に vault のサブディレクトリ構造を保持します（デフォルト：同名サブフォルダへフラット化）。',
    'dialog.conflictSingle': '{name} は既に存在します',
    'dialog.conflictMultiple': '対象フォルダに同名のファイルが {count} 個含まれています',
    'dialog.overwrite': '上書き',
    'dialog.skip': 'スキップ',
    'dialog.cancel': 'キャンセル',
  },

  ko: {
    'menu.title': 'TXT로 내보내기',
    'notice.exportedFile': '내보내기 완료: {name}',
    'notice.exportedFolder': '{count}개 파일을 내보냈습니다 → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (계층 유지)',
    'settings.header': 'TXT 내보내기 시 콘텐츠 처리 방식을 설정합니다. 파일이나 폴더를 우클릭하여 내보내세요.',
    'settings.stripFrontmatter.name': '프론트매터 제거',
    'settings.stripFrontmatter.desc': '내보낼 때 YAML 프론트매터(--- ... ---)를 제거합니다.',
    'settings.stripMarkdown.name': 'Markdown 기호 제거',
    'settings.stripMarkdown.desc': '# 제목, **굵게**, []() 링크 등 서식 기호를 제거합니다.',
    'settings.compact.name': '단락 사이 빈 줄 없음 (간결)',
    'settings.compact.desc': '단락 사이의 빈 줄을 제거하고 한 단락을 한 줄로 만듭니다.',
    'settings.preserveHierarchy.name': '디렉터리 계층 유지',
    'settings.preserveHierarchy.desc': '내보낼 때 vault의 하위 디렉터리 구조를 유지합니다 (기본값: 모든 노트를 동명의 하위 폴더에 평탄화).',
    'dialog.conflictSingle': '{name}이(가) 이미 존재합니다',
    'dialog.conflictMultiple': '대상 폴더에 같은 이름의 파일이 {count}개 있습니다',
    'dialog.overwrite': '덮어쓰기',
    'dialog.skip': '건너뛰기',
    'dialog.cancel': '취소',
  },

  de: {
    'menu.title': 'Als TXT exportieren',
    'notice.exportedFile': 'Exportiert: {name}',
    'notice.exportedFolder': '{count} Dateien exportiert → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (Hierarchie beibehalten)',
    'settings.header': 'Konfiguriert die Inhaltsverarbeitung beim TXT-Export. Rechtsklick auf eine Datei oder einen Ordner zum Exportieren.',
    'settings.stripFrontmatter.name': 'Frontmatter entfernen',
    'settings.stripFrontmatter.desc': 'YAML-Frontmatter (--- ... ---) beim Export entfernen.',
    'settings.stripMarkdown.name': 'Markdown-Formatierung entfernen',
    'settings.stripMarkdown.desc': 'Entfernt #-Überschriften, **Fett**, []()-Links und andere Formatierungssymbole.',
    'settings.compact.name': 'Keine Leerzeilen zwischen Absätzen (kompakt)',
    'settings.compact.desc': 'Leerzeilen zwischen Absätzen entfernen; ein Absatz pro Zeile.',
    'settings.preserveHierarchy.name': 'Verzeichnishierarchie beibehalten',
    'settings.preserveHierarchy.desc': 'Beim Export die Unterverzeichnisstruktur des Vaults beibehalten (Standard: alle Notizen in den gleichnamigen Unterordner abflachen).',
    'dialog.conflictSingle': '{name} existiert bereits',
    'dialog.conflictMultiple': 'Zielordner enthält bereits {count} Dateien mit demselben Namen',
    'dialog.overwrite': 'Überschreiben',
    'dialog.skip': 'Überspringen',
    'dialog.cancel': 'Abbrechen',
  },

  fr: {
    'menu.title': 'Exporter en TXT',
    'notice.exportedFile': 'Exporté : {name}',
    'notice.exportedFolder': '{count} fichiers exportés → {folder}{suffix}',
    'suffix.preserveHierarchy': " (hiérarchie conservée)",
    'settings.header': "Configurez le traitement du contenu lors de l'export TXT. Clic droit sur un fichier ou un dossier pour exporter.",
    'settings.stripFrontmatter.name': 'Supprimer le frontmatter',
    'settings.stripFrontmatter.desc': "Supprimer le frontmatter YAML (--- ... ---) lors de l'export.",
    'settings.stripMarkdown.name': 'Supprimer le formatage markdown',
    'settings.stripMarkdown.desc': 'Supprime les titres #, le **gras**, les liens []() et autres symboles de formatage.',
    'settings.compact.name': 'Aucun saut de ligne entre paragraphes (compact)',
    'settings.compact.desc': 'Supprime les lignes vides entre paragraphes ; un paragraphe par ligne.',
    'settings.preserveHierarchy.name': 'Conserver la hiérarchie des dossiers',
    'settings.preserveHierarchy.desc': "Conserve la structure des sous-dossiers du coffre lors de l'export (par défaut : tout aplatir dans le sous-dossier du même nom).",
    'dialog.conflictSingle': '{name} existe déjà',
    'dialog.conflictMultiple': 'Le dossier de destination contient déjà {count} fichiers avec le même nom',
    'dialog.overwrite': 'Écraser',
    'dialog.skip': 'Ignorer',
    'dialog.cancel': 'Annuler',
  },

  es: {
    'menu.title': 'Exportar a TXT',
    'notice.exportedFile': 'Exportado: {name}',
    'notice.exportedFolder': 'Exportados {count} archivos → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (jerarquía conservada)',
    'settings.header': 'Configura el procesamiento del contenido al exportar a TXT. Haz clic derecho en un archivo o carpeta para exportar.',
    'settings.stripFrontmatter.name': 'Eliminar frontmatter',
    'settings.stripFrontmatter.desc': 'Elimina el frontmatter YAML (--- ... ---) al exportar.',
    'settings.stripMarkdown.name': 'Eliminar formato markdown',
    'settings.stripMarkdown.desc': 'Elimina encabezados #, **negrita**, enlaces []() y otros símbolos de formato.',
    'settings.compact.name': 'Sin líneas en blanco entre párrafos (compacto)',
    'settings.compact.desc': 'Elimina las líneas en blanco entre párrafos; un párrafo por línea.',
    'settings.preserveHierarchy.name': 'Conservar jerarquía de directorios',
    'settings.preserveHierarchy.desc': 'Conserva la estructura de subdirectorios del vault al exportar (por defecto: aplana todas las notas en el subdirectorio del mismo nombre).',
    'dialog.conflictSingle': '{name} ya existe',
    'dialog.conflictMultiple': 'La carpeta de destino ya contiene {count} archivos con el mismo nombre',
    'dialog.overwrite': 'Sobrescribir',
    'dialog.skip': 'Omitir',
    'dialog.cancel': 'Cancelar',
  },

  pt: {
    'menu.title': 'Exportar para TXT',
    'notice.exportedFile': 'Exportado: {name}',
    'notice.exportedFolder': 'Exportados {count} ficheiros → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (hierarquia mantida)',
    'settings.header': 'Configure o processamento do conteúdo ao exportar para TXT. Clique com o botão direito num ficheiro ou pasta para exportar.',
    'settings.stripFrontmatter.name': 'Remover frontmatter',
    'settings.stripFrontmatter.desc': 'Remove o frontmatter YAML (--- ... ---) ao exportar.',
    'settings.stripMarkdown.name': 'Remover formatação markdown',
    'settings.stripMarkdown.desc': 'Remove cabeçalhos #, **negrito**, links []() e outros símbolos de formatação.',
    'settings.compact.name': 'Sem linhas em branco entre parágrafos (compacto)',
    'settings.compact.desc': 'Remove linhas em branco entre parágrafos; um parágrafo por linha.',
    'settings.preserveHierarchy.name': 'Manter hierarquia de diretórios',
    'settings.preserveHierarchy.desc': 'Mantém a estrutura de subdiretórios do vault ao exportar (predefinição: nivelar todas as notas na subpasta do mesmo nome).',
    'dialog.conflictSingle': '{name} já existe',
    'dialog.conflictMultiple': 'A pasta de destino já contém {count} ficheiros com o mesmo nome',
    'dialog.overwrite': 'Substituir',
    'dialog.skip': 'Ignorar',
    'dialog.cancel': 'Cancelar',
  },

  it: {
    'menu.title': 'Esporta in TXT',
    'notice.exportedFile': 'Esportato: {name}',
    'notice.exportedFolder': 'Esportati {count} file → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (gerarchia mantenuta)',
    'settings.header': "Configura l'elaborazione dei contenuti durante l'esportazione in TXT. Fai clic destro su un file o una cartella per esportare.",
    'settings.stripFrontmatter.name': 'Rimuovi frontmatter',
    'settings.stripFrontmatter.desc': "Rimuovi il frontmatter YAML (--- ... ---) durante l'esportazione.",
    'settings.stripMarkdown.name': 'Rimuovi formattazione markdown',
    'settings.stripMarkdown.desc': 'Rimuove intestazioni #, **grassetto**, link []() e altri simboli di formattazione.',
    'settings.compact.name': 'Nessuna riga vuota tra paragrafi (compatto)',
    'settings.compact.desc': 'Rimuove le righe vuote tra i paragrafi; un paragrafo per riga.',
    'settings.preserveHierarchy.name': 'Mantieni gerarchia delle cartelle',
    'settings.preserveHierarchy.desc': "Mantiene la struttura delle sottocartelle del vault durante l'esportazione (predefinito: appiattisce tutte le note nella sottocartella con lo stesso nome).",
    'dialog.conflictSingle': '{name} esiste già',
    'dialog.conflictMultiple': 'La cartella di destinazione contiene già {count} file con lo stesso nome',
    'dialog.overwrite': 'Sovrascrivi',
    'dialog.skip': 'Ignora',
    'dialog.cancel': 'Annulla',
  },

  th: {
    'menu.title': 'ส่งออกเป็น TXT',
    'notice.exportedFile': 'ส่งออกแล้ว: {name}',
    'notice.exportedFolder': 'ส่งออก {count} ไฟล์ → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (รักษาโครงสร้าง)',
    'settings.header': 'ตั้งค่าการประมวลผลเนื้อหาเมื่อส่งออกเป็น TXT คลิกขวาที่ไฟล์หรือโฟลเดอร์เพื่อส่งออก',
    'settings.stripFrontmatter.name': 'ลบ frontmatter',
    'settings.stripFrontmatter.desc': 'ลบ frontmatter รูปแบบ YAML (--- ... ---) เมื่อส่งออก',
    'settings.stripMarkdown.name': 'ลบเครื่องหมาย markdown',
    'settings.stripMarkdown.desc': 'ลบหัวข้อ #, **ตัวหนา**, ลิงก์ []() และสัญลักษณ์จัดรูปแบบอื่นๆ',
    'settings.compact.name': 'ไม่มีบรรทัดว่างระหว่างย่อหน้า (กะทัดรัด)',
    'settings.compact.desc': 'ลบบรรทัดว่างระหว่างย่อหน้า หนึ่งย่อหน้าต่อหนึ่งบรรทัด',
    'settings.preserveHierarchy.name': 'รักษาโครงสร้างไดเรกทอรี',
    'settings.preserveHierarchy.desc': 'รักษาโครงสร้างไดเรกทอรีย่อยของ vault เมื่อส่งออก (ค่าเริ่มต้น: แผ่ออกเป็นโฟลเดอร์ย่อยที่มีชื่อเดียวกัน)',
    'dialog.conflictSingle': '{name} มีอยู่แล้ว',
    'dialog.conflictMultiple': 'โฟลเดอร์ปลายทางมีไฟล์ชื่อเดียวกันอยู่ {count} ไฟล์',
    'dialog.overwrite': 'เขียนทับ',
    'dialog.skip': 'ข้าม',
    'dialog.cancel': 'ยกเลิก',
  },

  vi: {
    'menu.title': 'Xuất ra TXT',
    'notice.exportedFile': 'Đã xuất: {name}',
    'notice.exportedFolder': 'Đã xuất {count} tệp → {folder}{suffix}',
    'suffix.preserveHierarchy': ' (giữ cấu trúc)',
    'settings.header': 'Cấu hình cách xử lý nội dung khi xuất ra TXT. Nhấp chuột phải vào tệp hoặc thư mục để xuất.',
    'settings.stripFrontmatter.name': 'Bỏ frontmatter',
    'settings.stripFrontmatter.desc': 'Bỏ frontmatter YAML (--- ... ---) khi xuất.',
    'settings.stripMarkdown.name': 'Bỏ định dạng markdown',
    'settings.stripMarkdown.desc': 'Bỏ tiêu đề #, **in đậm**, liên kết []() và các ký hiệu định dạng khác.',
    'settings.compact.name': 'Không có dòng trống giữa các đoạn (gọn)',
    'settings.compact.desc': 'Bỏ các dòng trống giữa các đoạn; một đoạn trên một dòng.',
    'settings.preserveHierarchy.name': 'Giữ cấu trúc thư mục',
    'settings.preserveHierarchy.desc': 'Giữ cấu trúc thư mục con của vault khi xuất (mặc định: dàn phẳng tất cả ghi chú vào thư mục con cùng tên).',
    'dialog.conflictSingle': '{name} đã tồn tại',
    'dialog.conflictMultiple': 'Thư mục đích đã chứa {count} tệp có cùng tên',
    'dialog.overwrite': 'Ghi đè',
    'dialog.skip': 'Bỏ qua',
    'dialog.cancel': 'Hủy',
  },

};