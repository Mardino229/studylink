import {useEffect, useMemo, useState} from "react";

type EventItem = { id: string; title: string; date: string };

export default function Calendar() {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const raw = localStorage.getItem("sl_calendar_events");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sl_calendar_events", JSON.stringify(events));
    } catch {}
  }, [events]);

  const year = current.getFullYear();
  const month = current.getMonth();

  const monthLabel = current.toLocaleString(undefined, { month: "long", year: "numeric" });

  const days = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startIndex = ((firstDayIndex - 1) + 7) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;
    const cells: { date: Date | null }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startIndex + 1;
      if (dayNum < 1 || dayNum > daysInMonth) cells.push({ date: null });
      else cells.push({ date: new Date(year, month, dayNum) });
    }
    return cells;
  }, [year, month]);

  function prevMonth() {
    setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function addEvent() {
    setError("");
    if (!title.trim() || !date) { setError("Titre et date requis"); return; }
    const d = new Date(date);
    if (isNaN(d.getTime())) { setError("Date invalide"); return; }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setEvents(prev => [...prev, { id, title: title.trim(), date }]);
    setTitle(""); setDate("");
  }

  function removeEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const key = new Date(e.date).toDateString();
      const list = map.get(key) || [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Calendrier</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-3 py-1 rounded border border-border">◀</button>
          <div className="min-w-[160px] text-center font-medium capitalize">{monthLabel}</div>
          <button onClick={nextMonth} className="px-3 py-1 rounded border border-border">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-sm text-foreground/70 mb-2">
        {weekDays.map(w => (<div key={w} className="py-2 text-center">{w}</div>))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, idx) => {
          if (!cell.date) return <div key={idx} className="h-24 rounded bg-background/60 border border-dashed border-border" />;
          const key = cell.date.toDateString();
          const cellEvents = eventsByDay.get(key) || [];
          const isToday = new Date().toDateString() === key;
          return (
            <div key={idx} className={`h-24 rounded border p-1 overflow-hidden ${isToday ? "border-blue-500" : "border-border"}`}>
              <div className="text-xs mb-1 flex justify-between">
                <span className="font-medium">{cell.date.getDate()}</span>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-16 pr-1">
                {cellEvents.map(ev => (
                  <div key={ev.id} className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded px-1 py-0.5 flex justify-between items-center gap-1">
                    <span className="truncate" title={ev.title}>{ev.title}</span>
                    <button onClick={() => removeEvent(ev.id)} className="text-red-600">×</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm">Titre</label>
          <input className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Examen de chimie" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm">Date</label>
          <input type="date" className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button onClick={addEvent} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Ajouter</button>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
