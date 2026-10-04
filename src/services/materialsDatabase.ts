export interface MaterialItem {
  name: string;
  defaultUnit: string;
  defaultMinStock?: number;
  commonSpecs?: string[];
}

export interface MaterialCategory {
  name: string;
  items: MaterialItem[];
}

const inchSpecs = ["1/2\"", "3/4\"", "1\"", "1-1/4\"", "1-1/2\"", "2\"", "2-1/2\"", "3\"", "4\"", "6\"", "8\""];
const drainInchSpecs = ["1-1/2\"", "2\"", "3\"", "4\"", "6\"", "8\""];
const castIronDrainSpecs = ["2\"", "3\"", "4\"", "6\""];
const stainlessPressSpecs = ["15A", "20A", "25A", "32A", "40A", "50A", "65A", "80A", "100A"];
const pprSpecs = ["20mm", "25mm", "32mm", "40mm", "50mm", "63mm"];
const copperSpecs = ["2分", "3分", "4分", "5分", "6分", "1吋"];
const wireCrossSectionSpecs = ["1.6mm", "2.0mm", "2.6mm", "3.5mm²", "5.5mm²", "8mm²", "14mm²", "22mm²", "30mm²", "38mm²", "50mm²", "60mm²", "80mm²", "100mm²", "125mm²", "150mm²", "200mm²", "250mm²", "325mm²"];
const xlpeSpecs = ["3.5mm²", "5.5mm²", "8mm²", "14mm²", "22mm²", "30mm²", "38mm²", "50mm²", "60mm²", "80mm²", "100mm²"];
const cvvSpecs = ["2C x 1.25mm²", "3C x 1.25mm²", "4C x 1.25mm²", "5C x 1.25mm²", "7C x 1.25mm²", "2C x 2.0mm²", "3C x 2.0mm²"];
const groundWireSpecs = ["1.6mm", "2.0mm", "2.6mm", "5.5mm²", "8mm²", "14mm²", "22mm²", "38mm²"];
const nfb1PSpecs = ["10A", "15A", "20A", "30A", "40A", "50A"];
const nfb3PSpecs = ["10A", "15A", "20A", "30A", "40A", "50A", "60A", "75A", "100A"];
const elcb2PSpecs = ["15A", "20A", "30A", "40A", "50A"];
const elcb3PSpecs = ["15A", "20A", "30A", "50A", "75A", "100A"];
const boxLoopsSpecs = ["2迴路", "4迴路", "6迴路", "8迴路", "12迴路", "16迴路", "20迴路", "24迴路"];
const emtSpecs = ["3/4\"", "1\"", "1-1/4\"", "1-1/2\"", "2\""];

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    name: "給水管材",
    items: [
      { name: "PVC給水管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: inchSpecs.slice(0, 9) },
      { name: "CPVC給水管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: inchSpecs.slice(0, 9) },
      { name: "不鏽鋼壓接管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: stainlessPressSpecs },
      { name: "PPR熱熔管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: pprSpecs },
      { name: "被覆銅管", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: copperSpecs },
      { name: "鍍鋅鋼管", defaultUnit: "支", defaultMinStock: 5, commonSpecs: inchSpecs.slice(0, 10) }
    ]
  },
  {
    name: "給水管件",
    items: [
      { name: "PVC彎頭 (90°/45°)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC三通", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC大小頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC由令", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC凡而座", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC管塞", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC管帽", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC異徑接頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "不鏽鋼壓接彎頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "不鏽鋼壓接三通", defaultUnit: "個", defaultMinStock: 20 },
      { name: "不鏽鋼壓接大小頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "不鏽鋼壓接活接", defaultUnit: "個", defaultMinStock: 20 },
      { name: "銅管喇叭接頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "銅管焊接彎頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "銅管三通", defaultUnit: "個", defaultMinStock: 20 },
      { name: "鍍鋅彎頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "鍍鋅三通", defaultUnit: "個", defaultMinStock: 20 },
      { name: "鍍鋅由令", defaultUnit: "個", defaultMinStock: 20 },
      { name: "鍍鋅管塞", defaultUnit: "個", defaultMinStock: 20 },
      { name: "轉接頭", defaultUnit: "個", defaultMinStock: 20 }
    ]
  },
  {
    name: "排水管材",
    items: [
      { name: "PVC排水管(厚管)", defaultUnit: "支", defaultMinStock: 10, commonSpecs: drainInchSpecs },
      { name: "PVC排水管(薄管)", defaultUnit: "支", defaultMinStock: 10, commonSpecs: drainInchSpecs },
      { name: "鑄鐵排水管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: castIronDrainSpecs },
      { name: "ABS排水管", defaultUnit: "支", defaultMinStock: 10 },
      { name: "排水波紋軟管", defaultUnit: "捲", defaultMinStock: 5 }
    ]
  },
  {
    name: "排水管件",
    items: [
      { name: "PVC排水90°彎頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC排水45°彎頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC排水Y型三通", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC排水正三通", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC存水彎(S型/P型)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC清潔口", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC排水大小頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "落水頭(圓形/方形)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "地板排水口", defaultUnit: "個", defaultMinStock: 20 },
      { name: "屋頂落水頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "鑄鐵排水配件", defaultUnit: "個", defaultMinStock: 20 }
    ]
  },
  {
    name: "閥類與控制件",
    items: [
      { name: "銅球閥(凡而)", defaultUnit: "個", defaultMinStock: 5 },
      { name: "不鏽鋼球閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "PVC球閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "閘閥(制水閥)", defaultUnit: "個", defaultMinStock: 5 },
      { name: "蝶閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "逆止閥(乃逆/虹吸破壞器)", defaultUnit: "個", defaultMinStock: 5 },
      { name: "減壓閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "安全閥/洩壓閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "電磁閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "浮球閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "溫控混合閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "定水位閥", defaultUnit: "個", defaultMinStock: 5 }
    ]
  },
  {
    name: "衛浴設備與器具",
    items: [
      { name: "馬桶(單體式/分離式)", defaultUnit: "組", defaultMinStock: 2 },
      { name: "小便斗", defaultUnit: "組", defaultMinStock: 2 },
      { name: "臉盆(台上盆/台下盆/壁掛盆/立柱盆)", defaultUnit: "組", defaultMinStock: 2 },
      { name: "水龍頭(面盆龍頭/廚房龍頭/淋浴龍頭/感應式龍頭)", defaultUnit: "組", defaultMinStock: 2 },
      { name: "蓮蓬頭組", defaultUnit: "組", defaultMinStock: 2 },
      { name: "淋浴拉門", defaultUnit: "組", defaultMinStock: 2 },
      { name: "浴缸", defaultUnit: "個", defaultMinStock: 2 },
      { name: "角閥(三角凡而)", defaultUnit: "個", defaultMinStock: 2 },
      { name: "軟管(蛇管)", defaultUnit: "條", defaultMinStock: 2 },
      { name: "排水零件", defaultUnit: "組", defaultMinStock: 2 }
    ]
  },
  {
    name: "電線電纜",
    items: [
      { name: "PVC絕緣電線(IV線)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: wireCrossSectionSpecs },
      { name: "耐熱電線(HIV線)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: wireCrossSectionSpecs },
      { name: "交連PE電纜(XLPE)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: xlpeSpecs },
      { name: "控制電纜(CVV)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: cvvSpecs },
      { name: "接地線(綠色PVC/裸銅線)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: groundWireSpecs },
      { name: "網路線", defaultUnit: "箱", defaultMinStock: 5, commonSpecs: ["Cat5e", "Cat6", "Cat6A"] },
      { name: "電話線/對講機線", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: ["0.5mm 2P", "0.5mm 4P", "0.5mm 10P", "0.5mm 20P"] },
      { name: "同軸電纜", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: ["RG6", "RG11", "5C-2V"] },
      { name: "耐燃電纜(FR)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: wireCrossSectionSpecs }
    ]
  },
  {
    name: "電管與線槽",
    items: [
      { name: "PVC電管(E管)", defaultUnit: "支", defaultMinStock: 10, commonSpecs: ["E16(4分)", "E22(6分)", "E28(1吋)", "E36(1吋2)"] },
      { name: "EMT薄鋼管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: emtSpecs },
      { name: "IMC/RSC厚鋼管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: emtSpecs },
      { name: "CD管(可撓管)", defaultUnit: "捲", defaultMinStock: 5, commonSpecs: ["CD16", "CD22", "CD28", "CD36"] },
      { name: "PVC電管接頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC電管由令", defaultUnit: "個", defaultMinStock: 20 },
      { name: "PVC電管彎頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "護管帽", defaultUnit: "個", defaultMinStock: 20 },
      { name: "EMT接頭", defaultUnit: "個", defaultMinStock: 20 },
      { name: "EMT由令", defaultUnit: "個", defaultMinStock: 20 },
      { name: "EMT彎管器", defaultUnit: "個", defaultMinStock: 2 },
      { name: "線槽(PVC/金屬)", defaultUnit: "支", defaultMinStock: 10 },
      { name: "全牙吊桿", defaultUnit: "支", defaultMinStock: 10, commonSpecs: ["3/8\"", "1/2\""] }
    ]
  },
  {
    name: "配電器材",
    items: [
      { name: "無熔線斷路器NFB(1P)", defaultUnit: "個", defaultMinStock: 3, commonSpecs: nfb1PSpecs },
      { name: "無熔線斷路器NFB(2P)", defaultUnit: "個", defaultMinStock: 3, commonSpecs: nfb1PSpecs },
      { name: "無熔線斷路器NFB(3P)", defaultUnit: "個", defaultMinStock: 3, commonSpecs: nfb3PSpecs },
      { name: "漏電斷路器ELCB(2P)", defaultUnit: "個", defaultMinStock: 3, commonSpecs: elcb2PSpecs },
      { name: "漏電斷路器ELCB(3P)", defaultUnit: "個", defaultMinStock: 3, commonSpecs: elcb3PSpecs },
      { name: "配電箱(明裝)", defaultUnit: "組", defaultMinStock: 2, commonSpecs: boxLoopsSpecs },
      { name: "配電箱(暗裝)", defaultUnit: "組", defaultMinStock: 2, commonSpecs: boxLoopsSpecs },
      { name: "端子台", defaultUnit: "個", defaultMinStock: 10 },
      { name: "壓接端子", defaultUnit: "包", defaultMinStock: 5 },
      { name: "匯流排銅排", defaultUnit: "支", defaultMinStock: 5 },
      { name: "電表箱", defaultUnit: "組", defaultMinStock: 2 }
    ]
  },
  {
    name: "開關插座與面板",
    items: [
      { name: "單切開關", defaultUnit: "個", defaultMinStock: 20 },
      { name: "雙切開關", defaultUnit: "個", defaultMinStock: 20 },
      { name: "三路開關", defaultUnit: "個", defaultMinStock: 20 },
      { name: "調光開關(Dimmer)", defaultUnit: "個", defaultMinStock: 5 },
      { name: "雙孔插座(110V)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "三孔插座(110V)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "冷氣插座(220V T型)", defaultUnit: "個", defaultMinStock: 10 },
      { name: "USB插座", defaultUnit: "個", defaultMinStock: 5 },
      { name: "Type-C插座", defaultUnit: "個", defaultMinStock: 5 },
      { name: "防水蓋板", defaultUnit: "個", defaultMinStock: 10 },
      { name: "戶外防雨盒", defaultUnit: "個", defaultMinStock: 5 },
      { name: "面板底座(一聯/二聯/三聯/四聯)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "緊急押扣", defaultUnit: "個", defaultMinStock: 5 },
      { name: "門鈴開關", defaultUnit: "個", defaultMinStock: 5 },
      { name: "空白蓋板", defaultUnit: "個", defaultMinStock: 20 }
    ]
  },
  {
    name: "照明器材",
    items: [
      { name: "LED平板燈", defaultUnit: "組", defaultMinStock: 5, commonSpecs: ["1x1尺", "1x2尺", "2x2尺"] },
      { name: "LED崁燈", defaultUnit: "組", defaultMinStock: 5, commonSpecs: ["7.5cm", "10cm", "12cm", "15cm", "20cm"] },
      { name: "LED T8燈管", defaultUnit: "支", defaultMinStock: 10, commonSpecs: ["2尺", "4尺"] },
      { name: "LED T5層板燈", defaultUnit: "組", defaultMinStock: 5, commonSpecs: ["1尺", "2尺", "3尺", "4尺"] },
      { name: "投光燈/探照燈", defaultUnit: "組", defaultMinStock: 5, commonSpecs: ["10W", "20W", "30W", "50W", "100W", "150W", "200W"] },
      { name: "緊急照明燈", defaultUnit: "組", defaultMinStock: 5 },
      { name: "出口指示燈", defaultUnit: "組", defaultMinStock: 5 },
      { name: "感應式照明(人體感應/光感應)", defaultUnit: "組", defaultMinStock: 5 },
      { name: "戶外庭院燈", defaultUnit: "組", defaultMinStock: 2 },
      { name: "壁燈", defaultUnit: "組", defaultMinStock: 5 },
      { name: "燈座(E27/E14)", defaultUnit: "個", defaultMinStock: 10 }
    ]
  },
  {
    name: "消防設備材料",
    items: [
      { name: "消防灑水頭(標準型/快速反應型/隱藏式)", defaultUnit: "個", defaultMinStock: 10 },
      { name: "消防管材(鍍鋅鋼管/CPVC)", defaultUnit: "支", defaultMinStock: 10 },
      { name: "溝槽式接頭(Grooved coupling)", defaultUnit: "個", defaultMinStock: 10 },
      { name: "消防蝶閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "消防止回閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "消防洩水閥", defaultUnit: "個", defaultMinStock: 5 },
      { name: "消防箱(含水帶/瞄子)", defaultUnit: "組", defaultMinStock: 5 },
      { name: "滅火器(ABC乾粉/CO2)", defaultUnit: "支", defaultMinStock: 5 },
      { name: "偵煙探測器", defaultUnit: "個", defaultMinStock: 10 },
      { name: "偵溫探測器", defaultUnit: "個", defaultMinStock: 10 },
      { name: "火警受信總機", defaultUnit: "台", defaultMinStock: 1 },
      { name: "中繼器", defaultUnit: "個", defaultMinStock: 5 },
      { name: "火警鈴", defaultUnit: "個", defaultMinStock: 5 },
      { name: "排煙閘門", defaultUnit: "組", defaultMinStock: 2 }
    ]
  },
  {
    name: "五金與固定件",
    items: [
      { name: "膨脹螺絲(塑膠壁虎)", defaultUnit: "包", defaultMinStock: 10, commonSpecs: ["#6", "#8", "#10"] },
      { name: "膨脹螺絲(金屬壁虎)", defaultUnit: "包", defaultMinStock: 10, commonSpecs: ["3/8\"", "1/2\""] },
      { name: "化學錨栓", defaultUnit: "支", defaultMinStock: 10, commonSpecs: ["M10", "M12", "M16"] },
      { name: "管夾(U型夾)", defaultUnit: "個", defaultMinStock: 20 },
      { name: "單邊管夾", defaultUnit: "個", defaultMinStock: 20 },
      { name: "雙邊管夾", defaultUnit: "個", defaultMinStock: 20 },
      { name: "吊管夾", defaultUnit: "個", defaultMinStock: 20 },
      { name: "全牙螺桿", defaultUnit: "支", defaultMinStock: 10, commonSpecs: ["3/8\"", "1/2\""] },
      { name: "螺絲螺帽華司組", defaultUnit: "包", defaultMinStock: 10 },
      { name: "不鏽鋼束帶", defaultUnit: "包", defaultMinStock: 5 },
      { name: "尼龍束帶", defaultUnit: "包", defaultMinStock: 10 },
      { name: "號碼管/標示環", defaultUnit: "包", defaultMinStock: 5 }
    ]
  },
  {
    name: "密封與接著材料",
    items: [
      { name: "矽利康(透明/白色/黑色/灰色)", defaultUnit: "支", defaultMinStock: 10 },
      { name: "PVC膠(膠合劑)", defaultUnit: "罐", defaultMinStock: 10 },
      { name: "止洩帶(鐵氟龍帶)", defaultUnit: "捲", defaultMinStock: 20 },
      { name: "防火泥/防火填縫劑", defaultUnit: "包", defaultMinStock: 5 },
      { name: "防火膨脹條", defaultUnit: "條", defaultMinStock: 5 },
      { name: "電氣絕緣膠帶(黑/紅/藍/綠/黃/白)", defaultUnit: "捲", defaultMinStock: 20 },
      { name: "布膠帶(灰色)", defaultUnit: "捲", defaultMinStock: 5 },
      { name: "鋁箔膠帶", defaultUnit: "捲", defaultMinStock: 5 },
      { name: "管牙油/切削油", defaultUnit: "罐", defaultMinStock: 5 },
      { name: "防水發泡劑(PU發泡劑)", defaultUnit: "罐", defaultMinStock: 5 }
    ]
  },
  {
    name: "泵浦與機電設備",
    items: [
      { name: "加壓馬達/加壓機", defaultUnit: "台", defaultMinStock: 2, commonSpecs: ["1/4HP", "1/2HP", "1HP", "2HP"] },
      { name: "污水泵浦/抽水馬達", defaultUnit: "台", defaultMinStock: 2, commonSpecs: ["1/2HP", "1HP", "2HP", "3HP"] },
      { name: "揚水馬達", defaultUnit: "台", defaultMinStock: 2 },
      { name: "熱水器(瓦斯/電熱/太陽能)", defaultUnit: "台", defaultMinStock: 2 },
      { name: "抽風機/排風扇", defaultUnit: "台", defaultMinStock: 2, commonSpecs: ["8\"", "10\"", "12\"", "14\""] },
      { name: "全熱交換器", defaultUnit: "台", defaultMinStock: 1 },
      { name: "水塔/蓄水槽", defaultUnit: "座", defaultMinStock: 1 }
    ]
  }
];

export function generateDefaultOptions(): {
  categories: Record<string, string[]>;
  specifications: string[];
  units: string[];
  locations: string[];
  suppliers: string[];
  minStockMap: Record<string, number>;
} {
  const categoriesMap: Record<string, string[]> = {};
  const allSpecs = new Set<string>();
  const minStockMap: Record<string, number> = {};

  MATERIAL_CATEGORIES.forEach(category => {
    categoriesMap[category.name] = category.items.map(item => item.name);
    category.items.forEach(item => {
      if (item.commonSpecs) {
        item.commonSpecs.forEach(spec => allSpecs.add(spec));
      }
      if (item.defaultMinStock !== undefined) {
        minStockMap[item.name] = item.defaultMinStock;
      }
    });
  });

  const units = ['支', '個', '只', '顆', '組', '捲', '條', '包', '箱', '才', '公尺', '米', '台', '座', '片', '塊', '罐', '瓶', '卷', '套', '批', '式'];
  const locations = ['工務所總倉', 'A棟水電倉', 'B棟水電倉', '地下室機房', '屋頂機房', '臨時週轉倉'];
  const suppliers = ['大同水電材料行', '永大水電五金', '全國水電', '中南水電材料', '光華水電', '建成五金', '正豐管材', '台灣松下電工', '東亞照明', '國際牌經銷', '施耐德代理', '士林電機經銷', '台達電經銷', '和泰水電', '千暉消防器材'];

  return {
    categories: categoriesMap,
    specifications: Array.from(allSpecs),
    units,
    locations,
    suppliers,
    minStockMap
  };
}
