import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  UserX, 
  Clock, 
  Plus, 
  Trash2, 
  MapPin, 
  Briefcase
} from 'lucide-react';
import { CrewCalendarEvent, GlobalOptions } from '../../types';
import { saveCrewCalendarEvent, deleteCrewCalendarEvent } from '../../services/inventoryService';

interface Props {
  events: CrewCalendarEvent[];
  options: GlobalOptions;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CrewCalendarView: React.FC<Props> = ({
  events,
  options,
  onRefresh,
  onShowToast,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isAdding, setIsAdding] = useState(false);

  // 新增表單狀態
  const [crewName, setCrewName] = useState('');
  const [type, setType] = useState<'WORK' | 'LEAVE' | 'OVERTIME' | 'SITE_DUTY'>('WORK');
  const [siteLocation, setSiteLocation] = useState(options.locations[0] || '工務所總倉');
  const [workDescription, setWorkDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewName.trim() || !workDescription.trim()) {
      onShowToast('請填寫工班師傅姓名與施工/請假內容', 'error');
      return;
    }

    const newEvent: CrewCalendarEvent = {
      id: `crew-${Date.now()}`,
      date: selectedDate,
      crewName: crewName.trim(),
      type,
      siteLocation,
      workDescription: workDescription.trim(),
      notes: notes.trim()
    };

    await saveCrewCalendarEvent(newEvent);
    onShowToast(`已排定 ${crewName} 的日程`, 'success');
    setIsAdding(false);
    setCrewName('');
    setWorkDescription('');
    setNotes('');
    onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`確定刪除 ${name} 的此筆排程嗎？`)) {
      await deleteCrewCalendarEvent(id);
      onShowToast('已刪除排程', 'info');
      onRefresh();
    }
  };

  // 依當前選擇日期過濾
  const dateEvents = events.filter(e => e.date === selectedDate);
  const totalOnDuty = events.filter(e => e.date === selectedDate && e.type !== 'LEAVE').length;
  const totalLeave = events.filter(e => e.date === selectedDate && e.type === 'LEAVE').length;

  const getTypeBadge = (eventType: CrewCalendarEvent['type']) => {
    switch (eventType) {
      case 'WORK':
        return <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">正常出勤</span>;
      case 'LEAVE':
        return <span className="text-[11px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-500/30">請假事假</span>;
      case 'OVERTIME':
        return <span className="text-[11px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">夜間加班</span>;
      case 'SITE_DUTY':
        return <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">工區值班</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* 頂部日期選擇與統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 日期選擇卡片 */}
        <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="text-xs text-[#8A93A6]">查詢工作日</div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-white text-base focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg font-medium transition shadow-md shadow-cyan-600/20"
          >
            <Plus size={14} className="mr-1" />
            {isAdding ? '取消' : '登記排假/施工'}
          </button>
        </div>

        {/* 出勤工班數 */}
        <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-[#8A93A6]">本日現場施工工班</div>
            <div className="font-mono text-2xl font-bold text-emerald-400">{totalOnDuty} <span className="text-xs text-[#8A93A6]">位/組</span></div>
          </div>
        </div>

        {/* 請假人數 */}
        <div className="bg-[#202532] border border-[#2B3242] p-4 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500/30 flex items-center justify-center text-red-400">
            <UserX size={20} />
          </div>
          <div>
            <div className="text-xs text-[#8A93A6]">本日請假人數</div>
            <div className="font-mono text-2xl font-bold text-red-400">{totalLeave} <span className="text-xs text-[#8A93A6]">位</span></div>
          </div>
        </div>
      </div>

      {/* 新增排程抽屜 / 彈窗 */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-[#1C202B] border border-cyan-500/30 p-5 rounded-xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#282F3E] pb-2">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Clock size={16} className="mr-2 text-cyan-400" />
              登記 {selectedDate} 工班施工或休假
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#8A93A6] mb-1">師傅 / 工班名稱 *</label>
              <input
                type="text"
                placeholder="例如: 陳師傅 (配管組)"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                required
                className="w-full bg-[#151821] border border-[#2B3242] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8A93A6] mb-1">狀態類別</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#151821] border border-[#2B3242] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="WORK">正常出勤</option>
                <option value="LEAVE">請假 (事病假)</option>
                <option value="OVERTIME">夜間加班</option>
                <option value="SITE_DUTY">工區巡邏 / 值班</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8A93A6] mb-1">責任案場 / 施工區域</label>
              <select
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full bg-[#151821] border border-[#2B3242] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {options.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8A93A6] mb-1">施工或請假事由 *</label>
              <input
                type="text"
                placeholder="例如: B2層污排水幹管配管、梯廳照明配線定位..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                required
                className="w-full bg-[#151821] border border-[#2B3242] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8A93A6] mb-1">備註 / 搭配工班</label>
              <input
                type="text"
                placeholder="例如: 預計領用 PVC 耐衝擊管 20 支、代班師傅..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#151821] border border-[#2B3242] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#8A93A6] hover:bg-[#282F3E]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/20"
            >
              確認登記
            </button>
          </div>
        </form>
      )}

      {/* 當日排程事件清單 */}
      <div className="bg-[#202532] border border-[#2B3242] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#2B3242] flex justify-between items-center bg-[#181C25]">
          <h3 className="font-bold text-white text-sm flex items-center">
            <Briefcase size={16} className="mr-2 text-cyan-400" />
            {selectedDate} 工班施工日誌與排假清單
          </h3>
          <span className="text-xs text-[#8A93A6]">
            共 <strong className="text-cyan-400 font-mono">{dateEvents.length}</strong> 筆排程
          </span>
        </div>

        <div className="divide-y divide-[#282F3E]">
          {dateEvents.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-[#252B3A] transition flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white text-sm">{evt.crewName}</span>
                  {getTypeBadge(evt.type)}
                  <span className="text-xs text-cyan-300 flex items-center">
                    <MapPin size={12} className="mr-1 text-cyan-400" />
                    {evt.siteLocation}
                  </span>
                </div>
                <div className="text-xs text-[#A1AAB9]">
                  工作項目：<span className="text-white">{evt.workDescription}</span>
                </div>
                {evt.notes && (
                  <div className="text-[11px] text-[#717B8F]">
                    備註：{evt.notes}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(evt.id, evt.crewName)}
                className="text-[#717B8F] hover:text-red-400 p-2 rounded-lg hover:bg-[#181C25] transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {dateEvents.length === 0 && (
            <div className="py-16 text-center text-[#717B8F]">
              本日尚未登記任何工班出勤或請假排程，點擊右上角「登記排假/施工」開始建立。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

