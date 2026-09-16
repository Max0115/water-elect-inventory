import React, { useState } from 'react';
import { X, Camera, Calendar, User, MapPin, Sparkles, Loader2, UploadCloud } from 'lucide-react';
import { ToolItem } from '../../types';
import { borrowTool } from '../../services/toolsService';
import { compressImage } from '../../services/imageCompression';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tool: ToolItem | null;
  locations: string[];
  suppliers: string[];
}

export const BorrowToolModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  tool,
  locations,
  suppliers,
}) => {
  const [borrower, setBorrower] = useState('');
  const [location, setLocation] = useState(locations[0] || '工務所總倉');
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tool) return null;

  // 處理照片選擇並自動微縮壓縮
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 1280, 1280, 0.75);
      setPhotoUrl(compressed);
    } catch (err) {
      console.error('圖片壓縮失敗', err);
      alert('照片處理失敗，請重試');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrower.trim()) {
      alert('請填寫借用人或領用工班');
      return;
    }

    try {
      setIsSubmitting(true);
      await borrowTool(tool.id, borrower.trim(), location, expectedReturnDate, notes.trim(), photoUrl);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('借出登記失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#202532] border border-[#2F374A] rounded-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-[#2A3243] pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
              <span className="p-1 rounded bg-amber-500/20 text-amber-300 mr-2">
                <User size={16} />
              </span>
              登記機具借出
            </h3>
            <p className="text-xs text-[#8E96A4] mt-0.5">
              工具：<span className="text-cyan-300 font-semibold">{tool.name}</span> ({tool.id})
            </p>
          </div>
          <button onClick={onClose} className="text-[#8E96A4] hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 借用人 / 工班 */}
          <div>
            <label className="block text-[#8E96A4] mb-1 font-semibold">
              借用人 / 施工工班 <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="tool-borrowers"
                required
                placeholder="例如: 陳師傅、第一組配管工班..."
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
              <datalist id="tool-borrowers">
                {suppliers.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          {/* 使用案場 / 所在庫位 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E96A4] mb-1 font-semibold">
                施工案場 / 放置庫位
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* 預計歸還日期 */}
            <div>
              <label className="block text-[#8E96A4] mb-1 font-semibold">
                預計歸還日期 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* 備註 (機況/模具) */}
          <div>
            <label className="block text-[#8E96A4] mb-1 font-semibold">
              借用說明 / 配件備註
            </label>
            <textarea
              rows={2}
              placeholder="例如: 隨附壓接模具 4分與6分各一組、電線1條..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#161922] border border-[#2E3647] rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 手機拍照 / 存證照片 (前端秒級自動壓縮) */}
          <div className="bg-[#181C25] p-3.5 rounded-xl border border-[#28303F] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white flex items-center">
                <Camera size={14} className="mr-1.5 text-cyan-400" />
                機況存證照片 (手機拍照 / 上傳)
              </span>
              <span className="text-[10px] text-cyan-400 flex items-center">
                <Sparkles size={11} className="mr-1" /> 自動壓縮至 100KB 省空間
              </span>
            </div>

            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-[#2F374A] max-h-40 bg-black/50 flex items-center justify-center">
                <img src={photoUrl} alt="工具現況存證" className="max-h-40 object-contain" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow"
                  title="移除照片"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#2E3647] hover:border-cyan-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-[#161922]">
                {isCompressing ? (
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <Loader2 size={18} className="animate-spin" />
                    <span>正在進行高畫質微縮壓縮...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={24} className="text-[#626B7E] mb-1" />
                    <span className="text-gray-300 font-medium">點擊拍照或選擇相片</span>
                    <span className="text-[10px] text-[#717B8F] mt-0.5">自動縮圖最佳化，不佔伺服器空間</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  disabled={isCompressing}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 按鈕組 */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-[#2A3243]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-[#8E96A4] hover:text-white hover:bg-[#28303F] transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold transition shadow-lg shadow-amber-600/25 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> 登記中...
                </>
              ) : (
                '確認借出'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
