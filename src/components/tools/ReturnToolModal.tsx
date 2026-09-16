import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Wrench, Camera, Sparkles, Loader2, UploadCloud } from 'lucide-react';
import { ToolItem } from '../../types';
import { returnTool } from '../../services/toolsService';
import { compressImage } from '../../services/imageCompression';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tool: ToolItem | null;
  locations: string[];
}

export const ReturnToolModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  tool,
  locations,
}) => {
  const [returnLocation, setReturnLocation] = useState(locations[0] || '工務所總倉');
  const [conditionStatus, setConditionStatus] = useState<'NORMAL' | 'MAINTENANCE' | 'DAMAGED'>('NORMAL');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tool) return null;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 1280, 1280, 0.75);
      setPhotoUrl(compressed);
    } catch (err) {
      console.error('圖片壓縮失敗', err);
      alert('照片壓縮處理失敗');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await returnTool(tool.id, returnLocation, conditionStatus, notes.trim(), photoUrl);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('歸還登記失敗，請重試');
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
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 mr-2">
                <CheckCircle size={16} />
              </span>
              機具點收歸還
            </h3>
            <p className="text-xs text-[#8E96A4] mt-0.5">
              工具：<span className="text-cyan-300 font-semibold">{tool.name}</span> ({tool.id})
            </p>
          </div>
          <button onClick={onClose} className="text-[#8E96A4] hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* 原借用資訊簡報 */}
        <div className="bg-[#181C25] p-3 rounded-xl border border-[#282F3E] text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#717B8F]">原借用人 / 工班：</span>
            <span className="font-semibold text-white">{tool.currentBorrower || '現場工班'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#717B8F]">借出日期：</span>
            <span className="font-mono text-cyan-300">{tool.borrowDate || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#717B8F]">原預計歸還日：</span>
            <span className="font-mono text-[#8E96A4]">{tool.expectedReturnDate || '-'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 歸還放置庫位 */}
          <div>
            <label className="block text-[#8E96A4] mb-1 font-semibold">
              歸還收納庫位 / 地點
            </label>
            <select
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              className="w-full bg-[#161922] border border-[#2E3647] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* 機況點收結果 */}
          <div>
            <label className="block text-[#8E96A4] mb-1.5 font-semibold">
              機況與配件檢查結果 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setConditionStatus('NORMAL')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  conditionStatus === 'NORMAL'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#161922] border-[#2E3647] text-[#8E96A4] hover:text-white'
                }`}
              >
                <CheckCircle size={16} className={conditionStatus === 'NORMAL' ? 'text-emerald-400' : 'text-gray-500'} />
                <span>功能正常完整</span>
              </button>

              <button
                type="button"
                onClick={() => setConditionStatus('MAINTENANCE')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  conditionStatus === 'MAINTENANCE'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#161922] border-[#2E3647] text-[#8E96A4] hover:text-white'
                }`}
              >
                <Wrench size={16} className={conditionStatus === 'MAINTENANCE' ? 'text-amber-400' : 'text-gray-500'} />
                <span>需保養/耗材</span>
              </button>

              <button
                type="button"
                onClick={() => setConditionStatus('DAMAGED')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  conditionStatus === 'DAMAGED'
                    ? 'bg-red-950/60 border-red-500 text-red-300 font-bold'
                    : 'bg-[#161922] border-[#2E3647] text-[#8E96A4] hover:text-white'
                }`}
              >
                <AlertTriangle size={16} className={conditionStatus === 'DAMAGED' ? 'text-red-400' : 'text-gray-500'} />
                <span>故障待報修</span>
              </button>
            </div>
          </div>

          {/* 歸還說明 */}
          <div>
            <label className="block text-[#8E96A4] mb-1 font-semibold">
              歸還點收備註
            </label>
            <textarea
              rows={2}
              placeholder="例如: 外觀乾淨、壓接模具已歸位、機身已擦拭..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#161922] border border-[#2E3647] rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 歸還照片存證 */}
          <div className="bg-[#181C25] p-3.5 rounded-xl border border-[#28303F] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white flex items-center">
                <Camera size={14} className="mr-1.5 text-cyan-400" />
                歸還機況存證照片 (選填)
              </span>
              <span className="text-[10px] text-cyan-400 flex items-center">
                <Sparkles size={11} className="mr-1" /> 自動壓縮至 100KB
              </span>
            </div>

            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-[#2F374A] max-h-40 bg-black/50 flex items-center justify-center">
                <img src={photoUrl} alt="歸還存證照片" className="max-h-40 object-contain" />
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
                    <span>正在進行高畫質微縮壓縮...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={20} className="text-[#626B7E] mb-1" />
                    <span className="text-gray-300">拍照存證歸還機況</span>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold transition shadow-lg shadow-emerald-600/25 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> 點收中...
                </>
              ) : (
                '確認點收歸還'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
