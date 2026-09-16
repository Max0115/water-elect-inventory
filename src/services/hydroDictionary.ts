/**
 * 水電專屬「管件規格尺寸」與「零件台語/日語俗稱」辭典庫
 * 
 * 涵蓋：
 * 1. 1/8" 一路對照至 6" 之完整標準英吋規格與台語分數對照表。
 * 2. 常用材料零件台語俗稱、日語外來語與標準品名對照表。
 * 3. 智慧雙向模糊搜尋與開單俗稱標籤提示函式。
 */

// 1/8" 一路對照至 6" 之管件英吋與台語分數對照表
export const DEFAULT_PIPE_SIZE_ALIASES: Record<string, string[]> = {
  '1/8"': ['1分', '1/8', '一分'],
  '1/4"': ['2分', '1/4', '二分', '兩分'],
  '5/16"': ['2分半', '5/16', '二分半', '兩分半'],
  '3/8"': ['3分', '3/8', '三分'],
  '1/2"': ['4分', '半吋', '4/8', '1/2', '四分'],
  '5/8"': ['5分', '5/8', '五分'],
  '3/4"': ['6分', '6/8', '3/4', '六分'],
  '7/8"': ['7分', '7/8', '七分'],
  '1"': ['1吋', '8分', '1吋整', '一吋', '1"', '8/8'],
  '1-1/4"': ['1吋2', '1吋2分', '1-1/4', '1 1/4', '10分', '一吋二', '1吋1/4'],
  '1-1/2"': ['1吋半', '1吋4分', '1-1/2', '1 1/2', '12分', '一吋半', '1吋1/2'],
  '2"': ['2吋', '2"', '兩吋', '二吋', '16分'],
  '2-1/2"': ['2吋半', '2吋4分', '2-1/2', '2 1/2', '兩吋半'],
  '3"': ['3吋', '3"', '三吋'],
  '3-1/2"': ['3吋半', '3-1/2', '3 1/2', '三吋半'],
  '4"': ['4吋', '4"', '四吋'],
  '5"': ['5吋', '5"', '五吋'],
  '6"': ['6吋', '6"', '六吋']
};

// 水電零件常用台語、外來語俗稱與標準品名對照表
export const DEFAULT_PART_SYNONYMS: Record<string, string[]> = {
  '球閥': ['凡而', '考克', '球心閥', '凡爾', '閘閥', '水掣'],
  '90度彎頭': ['歐魯', 'OL', 'L接頭', '彎管', '彎頭', '90度彎頭', '45度OL 單放'],
  '三通': ['T接頭', 'OT', '茶壺', '立體三通'],
  '順水三通': ['順T', 'TY', '順水T', '順水三通'],
  '異徑接頭': ['卜申', '大小頭', '異徑套管', '異徑S', '異徑接頭', '異徑管'],
  '直接頭': ['索吉特', '直接', '同徑接頭', '套管', '電S', '套銅S', '給水直接頭'],
  '活接頭': ['由令', '快拆接頭', '活接頭'],
  '雙外牙短管': ['立布', '短管', '雙外牙', '雙外牙短管'],
  '外牙塞頭': ['塞頭', '普拉各', '管塞', '外牙塞頭'],
  '管帽': ['卡普', '盲蓋', '管帽'],
  '膨脹螺栓': ['壁虎', '安卡', '金屬壁虎', '膨脹螺栓'],
  '墊圈': ['華司', '哇夏', '墊片', '平華司', '彈簧華司'],
  '不鏽鋼': ['ST', '白鐵', '不銹鋼'],
  '波紋管': ['CD管', '浪管', '蛇管', '波紋管', '電線導管'],
  '無熔線斷路器': ['NFB', '黑掣', '無熔絲開關', '斷路器', '無熔線斷路器'],
  '漏電斷路器': ['ELB', '漏電開關', '漏電保護器', '漏電斷路器']
};

/**
 * 取得品名或規格的台語俗稱提示標籤
 * 例如：傳入 "90度彎頭" 返回 "俗稱: 歐魯/OL"
 * 例如：傳入 "1/2\"" 返回 "台語: 4分"
 */
export function getDialectHint(
  itemName: string,
  specification: string,
  customSynonyms?: Record<string, string[]>,
  customSizeAliases?: Record<string, string[]>
): { itemHint?: string; specHint?: string } {
  const synonyms = customSynonyms || DEFAULT_PART_SYNONYMS;
  const sizeAliases = customSizeAliases || DEFAULT_PIPE_SIZE_ALIASES;

  let itemHint: string | undefined;
  let specHint: string | undefined;

  // 1. 查找品名俗稱
  for (const [stdName, aliases] of Object.entries(synonyms)) {
    if (stdName === itemName || aliases.includes(itemName) || itemName.includes(stdName)) {
      const topAlias = aliases.filter(a => a !== itemName).slice(0, 2).join(' / ');
      if (topAlias) {
        itemHint = `俗稱: ${topAlias}`;
      }
      break;
    }
  }

  // 2. 查找尺寸俗稱
  for (const [stdSize, aliases] of Object.entries(sizeAliases)) {
    if (stdSize === specification || aliases.includes(specification)) {
      const topAlias = aliases.filter(a => a !== specification).slice(0, 2).join(' / ');
      if (topAlias) {
        specHint = `俗稱: ${topAlias}`;
      }
      break;
    }
  }

  return { itemHint, specHint };
}

/**
 * 水電智慧雙向模糊搜尋
 * 
 * 支援多關鍵字以空白分隔 (如: "4分 凡而")，並自動展開俗稱同義詞
 * 範例：
 * - 搜尋 "4分 凡而" -> 自動比對包含 "1/2\"" 且為 "球閥" 或 "凡而" 之料品
 * - 搜尋 "歐魯" -> 自動比對包含 "OL"、"彎頭" 或 "90度彎頭" 之料品
 */
export function matchesHydroQuery(
  item: {
    category?: string;
    itemName: string;
    specification: string;
    location?: string;
  },
  queryString: string,
  customSynonyms?: Record<string, string[]>,
  customSizeAliases?: Record<string, string[]>
): boolean {
  const trimmed = queryString.trim();
  if (!trimmed) return true;

  const synonyms = customSynonyms || DEFAULT_PART_SYNONYMS;
  const sizeAliases = customSizeAliases || DEFAULT_PIPE_SIZE_ALIASES;

  const itemCategory = (item.category || '').toLowerCase();
  const itemName = item.itemName.toLowerCase();
  const itemSpec = item.specification.toLowerCase();
  const itemLoc = (item.location || '').toLowerCase();

  // 拆分使用者輸入的關鍵字詞
  const queryKeywords = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  // 檢查所有關鍵字詞是否皆滿足 (AND 關係)
  return queryKeywords.every(keyword => {
    // 1. 直接比對現有文字欄位
    if (
      itemName.includes(keyword) ||
      itemSpec.includes(keyword) ||
      itemCategory.includes(keyword) ||
      itemLoc.includes(keyword)
    ) {
      return true;
    }

    // 2. 透過「管件規格尺寸對照表」展開同義詞
    for (const [stdSize, aliases] of Object.entries(sizeAliases)) {
      const allVariations = [stdSize.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
      // 如果使用者輸入的 keyword 屬於該尺寸群組
      if (allVariations.some(v => v === keyword || keyword.includes(v) || v.includes(keyword))) {
        // 只要當前品項的規格符合該群組的任何一個名稱即可
        if (allVariations.some(v => itemSpec.includes(v) || v.includes(itemSpec))) {
          return true;
        }
      }
    }

    // 3. 透過「零件台語/外來語俗稱對照表」展開同義詞
    for (const [stdName, aliases] of Object.entries(synonyms)) {
      const allVariations = [stdName.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
      // 如果使用者輸入的 keyword 屬於該品名俗稱群組
      if (allVariations.some(v => v === keyword || keyword.includes(v) || v.includes(keyword))) {
        // 只要當前品項的名稱符合該群組的任何一個名稱即可
        if (allVariations.some(v => itemName.includes(v) || v.includes(itemName))) {
          return true;
        }
      }
    }

    return false;
  });
}

