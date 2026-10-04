/**
 * 水電專屬「管件規格尺寸」與「零件台語/日語俗稱」辭典庫
 * 
 * 涵蓋：
 * 1. 1/8" 一路對照至 6" 之完整標準英吋規格與台語分數、公制、DN/A 標稱尺寸對照表。
 * 2. 常用材料零件台語俗稱、日語外來語與標準品名對照表 (破百項)。
 * 3. 智慧雙向模糊搜尋與開單俗稱標籤提示函式。
 */

// 1/8" 一路對照至 6" 之管件英吋與台語分數對照表、A/DN標稱及公制對應
export const DEFAULT_PIPE_SIZE_ALIASES: Record<string, string[]> = {
  '1/8"': ['1分', '1/8', '一分', '6mm'],
  '1/4"': ['2分', '1/4', '二分', '兩分', '8mm'],
  '5/16"': ['2分半', '5/16', '二分半', '兩分半', '10mm'],
  '3/8"': ['3分', '3/8', '三分', '10mm', '12mm'],
  '1/2"': ['4分', '半吋', '4/8', '1/2', '四分', '15A', 'DN15', '15mm'],
  '5/8"': ['5分', '5/8', '五分', '16mm'],
  '3/4"': ['6分', '6/8', '3/4', '六分', '20A', 'DN20', '20mm'],
  '7/8"': ['7分', '7/8', '七分', '22mm'],
  '1"': ['1吋', '8分', '1吋整', '一吋', '1"', '8/8', '25A', 'DN25', '25mm'],
  '1-1/4"': ['1吋2', '1吋2分', '1-1/4', '1 1/4', '10分', '一吋二', '1吋1/4', '32A', 'DN32', '32mm'],
  '1-1/2"': ['1吋半', '1吋4分', '1-1/2', '1 1/2', '12分', '一吋半', '1吋1/2', '40A', 'DN40', '40mm'],
  '2"': ['2吋', '2"', '兩吋', '二吋', '16分', '50A', 'DN50', '50mm'],
  '2-1/2"': ['2吋半', '2吋4分', '2-1/2', '2 1/2', '兩吋半', '65A', 'DN65', '65mm'],
  '3"': ['3吋', '3"', '三吋', '80A', 'DN80', '80mm'],
  '3-1/2"': ['3吋半', '3-1/2', '3 1/2', '三吋半', '90A', 'DN90', '90mm'],
  '4"': ['4吋', '4"', '四吋', '100A', 'DN100', '100mm'],
  '5"': ['5吋', '5"', '五吋', '125A', 'DN125', '125mm'],
  '6"': ['6吋', '6"', '六吋', '150A', 'DN150', '150mm'],
  
  // 電管規格
  'E16': ['E16', '4分管', '16mm'],
  'E22': ['E22', '6分管', '22mm'],
  'E28': ['E28', '1吋管', '28mm'],
  'E36': ['E36', '1-1/4吋管', '36mm'],
  
  // 線徑規格
  '1.6mm': ['1.6', '1.6mm', '#14 AWG', '14AWG', '2mm²'],
  '2.0mm': ['2.0', '2.0mm', '#12 AWG', '12AWG', '3.5mm²'],
  '2.6mm': ['2.6', '2.6mm', '#10 AWG', '10AWG', '5.5mm²'],
  '3.5mm': ['3.5', '3.5mm', '#8 AWG', '8AWG', '8mm²']
};

// 水電零件常用台語、外來語俗稱與標準品名對照表 (百大擴充版)
export const DEFAULT_PART_SYNONYMS: Record<string, string[]> = {
  // 原有項目與閥類
  '球閥': ['凡而', '考克', '球心閥', '凡爾', '水掣'],
  '閘閥': ['制水閥', 'gate valve'],
  '逆止閥': ['乃逆', 'check valve', '單向閥'],
  '蝶閥': ['butterfly valve'],
  '減壓閥': ['減壓閥'],
  '安全閥': ['安全閥'],
  '電磁閥': ['電磁閥'],
  '浮球閥': ['浮球閥'],
  
  // 管件與接頭
  '90度彎頭': ['歐魯', 'OL', 'L接頭', '彎管', '彎頭', '45度OL 單放'],
  '三通': ['T接頭', 'OT', '茶壺', '立體三通'],
  '順水三通': ['順T', 'TY', '順水T'],
  '異徑接頭': ['卜申', '大小頭', '異徑套管', '異徑S', '異徑管', 'reducer'],
  '直接頭': ['索吉特', '直接', '同徑接頭', '套管', '電S', '套銅S', '給水直接頭'],
  '活接頭': ['由令', '快拆接頭', 'union'],
  '雙外牙短管': ['立布', '短管', '雙外牙'],
  '外牙塞頭': ['塞頭', '普拉各', '管塞', 'plug'],
  '管帽': ['卡普', '盲蓋', 'cap'],
  '凡而座': ['凡而由令', '閥座'],
  '法蘭': ['flange', '法蘭片'],
  
  // 衛浴與排水
  '存水彎': ['S-trap', 'P-trap', '防臭彎'],
  '清潔口': ['C.O.', '清除孔'],
  '落水頭': ['地漏', 'floor drain'],
  'Y型接頭': ['Y管', 'Y通'],
  '面盆龍頭': ['臉盆水龍頭', '洗臉盆龍頭'],
  '角閥': ['三角凡而', '三角閥'],
  '軟管': ['蛇管', 'braided hose', '高壓軟管'],
  
  // 電氣開關與斷路器
  '無熔線斷路器': ['NFB', '黑掣', '無熔絲開關', '斷路器', 'breaker'],
  '漏電斷路器': ['ELCB', 'ELB', '漏電開關', '漏電保護器'],
  '開關': ['switch', '切電', '電燈開關'],
  '插座': ['outlet', 'socket', '插孔'],
  '配電箱': ['panel board', '電箱', '開關箱'],
  
  // 電機控制元件
  '端子台': ['terminal block', '接線座'],
  '壓接端子': ['crimp terminal', '端子', 'R型端子', 'Y型端子'],
  '電磁接觸器': ['contactor', 'MS', '電磁開關'],
  '電驛': ['relay', '繼電器'],
  '比流器': ['CT', '電流互感器'],
  
  // 電線與管槽
  'IV線': ['PVC電線', '單芯線'],
  'HIV線': ['耐熱電線'],
  '接地線': ['ground wire', '綠線', '地線'],
  '花線': ['軟線', 'stranded wire'],
  'PVC電管': ['E管', '塑膠硬管'],
  'EMT': ['薄鋼管', 'EMT管'],
  '波紋管': ['CD管', '浪管', '蛇管', '電線導管', '可撓管'],
  '線槽': ['cable tray', '壓條', '配線槽'],
  
  // 消防
  '灑水頭': ['撒水頭', 'sprinkler'],
  '偵煙探測器': ['smoke detector', '偵煙'],
  '受信總機': ['fire alarm panel', '火警主機'],
  
  // 五金緊固件
  '膨脹螺栓': ['壁虎', '安卡', '金屬壁虎'],
  '墊圈': ['華司', '哇夏', '墊片', '平華司', '彈簧華司'],
  '螺絲': ['screw'],
  '螺帽': ['nut', '螺母'],
  '全牙': ['threaded rod', '牙條'],
  '管夾': ['pipe clamp', 'U-bolt', 'U型夾'],
  '束帶': ['cable tie', '紮帶', '束線帶'],
  '不鏽鋼': ['ST', '白鐵', '不銹鋼'],
  
  // 化工與密封材
  '矽利康': ['silicone', '矽膠', '打水路'],
  'PVC膠': ['膠合劑', '塑膠油', '硬質膠合劑'],
  '止洩帶': ['鐵氟龍帶', 'teflon tape', '貼布西魯'],
  '防火泥': ['fire stop putty', '防火填塞'],
  
  // 工具與機具
  '砂輪機': ['grinder', '弗爛打'],
  '電鑽': ['drill', '電動鑽'],
  '壓接鉗': ['crimping tool', '壓接機'],
  '通管機': ['drain snake', '通條'],
  '彎管器': ['pipe bender', '彎管機']
};

/**
 * 取得品名或規格的台語俗稱提示標籤
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
 * 統一正規化引號 (全形半形、單雙引號皆轉為標準雙引號 ")
 */
function normalizeQuotes(str: string): string {
  return str.replace(/['"”"“’‘＂`]/g, '"');
}

/**
 * 權重精準度比對演算法
 */
function isMatch(keyword: string, variation: string): boolean {
  if (keyword === variation) return true;
  if (keyword.length >= 2 && (keyword.startsWith(variation) || variation.startsWith(keyword))) return true;
  if (variation.length >= 3 && keyword.includes(variation)) return true;
  if (keyword.length >= 3 && variation.includes(keyword)) return true; // 避免短字串(如"2")的誤判，限制關鍵字需 >= 3
  return false;
}

/**
 * 水電智慧雙向模糊搜尋
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

  const itemCategory = normalizeQuotes((item.category || '').toLowerCase());
  const itemName = normalizeQuotes(item.itemName.toLowerCase());
  const itemSpec = normalizeQuotes(item.specification.toLowerCase());
  const itemLoc = normalizeQuotes((item.location || '').toLowerCase());

  const queryKeywords = normalizeQuotes(trimmed.toLowerCase()).split(/\s+/).filter(Boolean);

  return queryKeywords.every(keyword => {
    // 單一字元數字不觸發規格擴展搜尋 (避免如 "2" 匹配到 "1/2" 或 "2分")
    const isSingleCharNumber = keyword.length === 1 && !isNaN(Number(keyword));

    // 1. 直接比對現有文字欄位
    if (
      itemName.includes(keyword) ||
      itemSpec.includes(keyword) ||
      itemCategory.includes(keyword) ||
      itemLoc.includes(keyword)
    ) {
      return true;
    }

    if (!isSingleCharNumber) {
      // 2. 透過「管件規格尺寸對照表」展開同義詞
      for (const [stdSize, aliases] of Object.entries(sizeAliases)) {
        const allVariations = [stdSize.toLowerCase(), ...aliases.map(a => a.toLowerCase())].map(normalizeQuotes);
        
        if (allVariations.some(v => isMatch(keyword, v))) {
          if (allVariations.some(v => itemSpec.includes(v) || v.includes(itemSpec))) {
            return true;
          }
        }
      }
    }

    // 3. 透過「零件台語/外來語俗稱對照表」展開同義詞
    for (const [stdName, aliases] of Object.entries(synonyms)) {
      const allVariations = [stdName.toLowerCase(), ...aliases.map(a => a.toLowerCase())].map(normalizeQuotes);
      
      if (allVariations.some(v => isMatch(keyword, v))) {
        if (allVariations.some(v => itemName.includes(v) || v.includes(itemName))) {
          return true;
        }
      }
    }

    return false;
  });
}
