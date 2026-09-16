import React, { useState } from 'react';
import { X, UploadCloud, Download, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { OrderItem, GlobalOptions } from '../../types';
import { saveOrderWithItems } from '../../services/inventoryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  options: GlobalOptions;
  defaultLocation: string;
}

export const ExcelImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  options,
  defaultLocation,
}) => {
  const [parsedItems, setParsedItems] = useState<OrderItem[]>([]);
  const [supplier, setSupplier] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // 下載標準匯入範本
  const downloadTemplate = () => {
    const templateData = [
      {
        '材料分類': 'PVC另件材料',
        '品名': '電S 1"',
        '規格': '1"',
        '數量': 50,
        '單位': '只',
        '案場/庫位': options.locations[0] || '工務所總倉',
        '廠商名稱': '太乙水電材料',
        '備註': '採購首批進場'
      },
      {
        '材料分類': 'PVC管材',
        '品名': '耐衝擊管 1"(25)',
        '規格': '1"(25)',
        '數量': 30,
        '單位': '支',
        '案場/庫位': options.locations[0] || '工務所總倉',
        '廠商名稱': '南亞管材行',
        '備註': '地下一樓配管'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '進貨範本');
    XLSX.writeFile(workbook, '水電材料進貨匯入範本.xlsx');
  };

  // 處理上傳檔案解析
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (!jsonData || jsonData.length === 0) {
          setErrorMsg('Excel 檔案內無資料或格式不符');
          return;
        }

        const items: OrderItem[] = jsonData.map((row, idx) => {
          return {
            orderDate,
            orderIndex: idx + 1,
            type: 'IN',
            category: row['材料分類'] || row['分類'] || 'PVC另件材料',
            itemName: row['品名'] || row['材料名稱'] || '未指定材料',
            specification: row['規格'] || row['型號'] || '-',
            quantity: Number(row['數量']) || 1,
            unit: row['單位'] || '只',
            location: row['案場/庫位'] || row['地點'] || defaultLocation || '工務所總倉',
            supplier: row['廠商名稱'] || row['廠商'] || supplier,
            notes: row['備註'] || ''
          };
        });

        if (items.length > 0 && items[0].supplier) {
          setSupplier(items[0].supplier);
        }

        setParsedItems(items);
      } catch (err) {
        console.error(err);
        setErrorMsg('解析 Excel 失敗，請確認檔案為標準 .xlsx 或 .xls');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 執行批次寫入
  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) return;
    setLoading(true);
    try {
      const itemsToSave = parsedItems.map(it => ({
        ...it,
        orderDate,
        supplier: supplier || it.supplier
      }));

      await saveOrderWithItems('IN', orderDate, itemsToSave, 'admin@system.local');
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setErrorMsg('批次儲存至庫存失敗，請檢查資料庫狀態');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#202532] border border-[#2F374A] rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] flex flex-col shadow-2xl">
        {/* 標題與關閉 */}
        <div className="flex justify-between items-center pb-4 border-b border-[#2A3243]">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="text-emerald-400" size={22} />
            <h2 className="text-lg font-bold text-white">Excel 批次進貨單匯入</h2>
          </div>
          <button onClick={onClose} className="text-[#8E96A4] hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* 下載範本與上傳區 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#181C25] p-4 rounded-xl border border-[#28303F] flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white text-xs mb-1">1. 下載標準匯入範本</h3>
                <p className="text-[11px] text-[#7E889B] leading-relaxed">
                  包含水電常用材料分類、規格、單位之標準 Excel 欄位格式。
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="mt-3 flex items-center justify-center text-xs bg-[#242C3C] hover:bg-[#2D364A] text-emerald-400 py-2 px-3 rounded-lg border border-emerald-500/20 font-medium transition"
              >
                <Download size={14} className="mr-1.5" /> 下載進貨單範本.xlsx
              </button>
            </div>

            <div className="bg-[#181C25] p-4 rounded-xl border border-[#28303F] flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white text-xs mb-1">2. 上傳填寫完成的 Excel</h3>
                <p className="text-[11px] text-[#7E889B] leading-relaxed">
                  支援 .xlsx 與 .xls 格式，系統將自動解析並即時預覽。
                </p>
              </div>
              <label className="mt-3 flex items-center justify-center text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 py-2 px-3 rounded-lg border border-cyan-500/30 font-medium cursor-pointer transition">
                <UploadCloud size={15} className="mr-1.5" />
                <span>{fileName ? fileName : '選取 Excel 檔案'}</span>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* 單據設定 */}
          <div className="grid grid-cols-2 gap-4 bg-[#181C25] p-4 rounded-xl border border-[#28303F]">
            <div>
              <label className="block text-[11px] text-[#7E889B] mb-1 font-medium">進貨入庫日期</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-[#1F2430] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#7E889B] mb-1 font-medium">供貨廠商名稱 (可統一套用)</label>
              <input
                type="text"
                placeholder="例如: 太乙水電材料..."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#1F2430] border border-[#2E3647] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 錯誤警告 */}
          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-red-300 bg-red-950/50 p-3 rounded-lg border border-red-500/40">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 預覽清單 */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-white flex items-center">
                  <Check size={14} className="mr-1 text-emerald-400" />
                  已成功解析品項清單（共 {parsedItems.length} 項材料）：
                </h4>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-[#28303F] bg-[#181C25]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141720] text-[#7E889B] sticky top-0 border-b border-[#28303F]">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">分類</th>
                      <th className="py-2 px-3">品名</th>
                      <th className="py-2 px-3">規格</th>
                      <th className="py-2 px-3 text-right">數量</th>
                      <th className="py-2 px-3">單位</th>
                      <th className="py-2 px-3">入庫庫位</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232A37]">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#1E232E] text-white">
                        <td className="py-2 px-3 text-[#7E889B] font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 text-[#7E889B]">{item.category}</td>
                        <td className="py-2 px-3 font-medium">{item.itemName}</td>
                        <td className="py-2 px-3 text-cyan-300">{item.specification}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{item.quantity}</td>
                        <td className="py-2 px-3 text-[#7E889B]">{item.unit}</td>
                        <td className="py-2 px-3 text-[#7E889B]">{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 底部動作 */}
        <div className="pt-4 border-t border-[#2A3243] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-[#8E96A4] hover:text-white hover:bg-[#2A3141] transition"
          >
            取消
          </button>
          <button
            type="button"
            disabled={parsedItems.length === 0 || loading}
            onClick={handleConfirmImport}
            className="flex items-center px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 transition"
          >
            {loading ? '匯入處理中...' : `確認匯入此進貨單 (${parsedItems.length} 項)`}
          </button>
        </div>
      </div>
    </div>
  );
};

