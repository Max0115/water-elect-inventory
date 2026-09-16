import React, { useState } from 'react';
import { X, Plus, Wrench, Camera, Sparkles, Loader2, UploadCloud } from 'lucide-react';
import { ToolItem } from '../../types';
import { saveTool } from '../../services/toolsService';
import { compressImage } from '../../services/imageCompression';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locations: string[];
}

const TOOL_CATEGORIES = [
  '動力壓接類',
  '水管專用類',
  '電氣檢測類',
  '水平放樣類',
  '大型機具類',
  '常用手工具'
];

export const AddToolModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  locations,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(TOOL_CATEGORIES[0]);
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState(locations[0] || '工務所總倉');
  const [conditionNote, setConditionNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 1280, 1280, 0.75);
      setPhotoUrl(compressed);
    } catch (err) {
      console.error(err);
      alert('照片壓縮失敗');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('請填寫機具名稱');
      return;
    }

    try {
      setIsSubmitting(true);
      const newId = `TL-${String(Math.floor(Math.random() * 900) + 100)}`;
      const newTool: ToolItem = {
        id: newId,
        name: name.trim(),
        category,
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        status: 'AVAILABLE',
        currentLocation: location,
        conditionNote: conditionNote.trim() || undefined,
        photoUrl: photoUrl || undefined,
        lastInspectionDate: new Date().toISOString().split('T')[0]
      };

      await saveTool(newTool);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('新增機具失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#202532] border border-[#2F374A] rounded-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-[#2A3243] pb-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
            <span className="p-1 rounded bg-cyan-500/20 text-cyan-300 mr-2">
              <Plus size={16} />
            </span>
            新增機具 / 檢測儀器
          </h3>
          <button onClick={onClose} className="text-[#8E96A4] hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#8E96A4] mb-1 font-semibold">
              機具名稱 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如: 電動油壓壓接機、絕緣電阻計..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E96A4] mb-1 font-semibold">機具分類</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {TOOL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#8E96A4] mb-1 font-semibold">放置庫位</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8E96A4] mb-1 font-semibold">廠牌與型號</label>
              <input
                type="text"
                placeholder="例如: Milwaukee M18, REX..."
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[#8E96A4] mb-1 font-semibold">機身號 / 序號</label>
              <input
                type="text"
                placeholder="例如: MLW-883921..."
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8E96A4] mb-1 font-semibold">機況與配件備註</label>
            <textarea
              rows={2}
              placeholder="例如: 附 4分/6分 壓接模具各 1 組、充電器 1 顆..."
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              className="w-full bg-[#161922] border border-[#2E3647] rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 拍照存證 */}
          <div className="bg-[#181C25] p-3.5 rounded-xl border border-[#28303F] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white flex items-center">
                <Camera size={14} className="mr-1.5 text-cyan-400" /> 機具外觀照
              </span>
              <span className="text-[10px] text-cyan-400 flex items-center">
                <Sparkles size={11} className="mr-1" /> 自動壓縮至 100KB
              </span>
            </div>

            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-[#2F374A] max-h-40 bg-black/50 flex items-center justify-center">
                <img src={photoUrl} alt="機具外觀" className="max-h-40 object-contain" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#2E3647] hover:border-cyan-500/60 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-[#161922]">
                {isCompressing ? (
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <Loader2 size={18} className="animate-spin" />
                    <span>壓縮縮圖中...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={20} className="text-[#626B7E] mb-1" />
                    <span className="text-gray-300">上傳機具相片</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isCompressing}
                  className="hidden"
                />
              </label>
            )}
          </div>

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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition shadow-lg shadow-cyan-600/25 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> 儲存中...
                </>
              ) : (
                '確認新增'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
