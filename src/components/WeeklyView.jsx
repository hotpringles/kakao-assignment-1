import { formatDateKey } from "../utils/date";

function formatWeekRange(weekDays) {
  const s = weekDays[0];
  const e = weekDays[6];
  return `${s.getMonth() + 1}월 ${s.getDate()}일 ~ ${e.getMonth() + 1}월 ${e.getDate()}일`;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function WeeklyView({
  weekDays,
  todos,
  currentFilter,
  currentDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) {
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(currentDate);

  return (
    <div className="bg-surface border-[1.5px] border-border rounded-[18px] px-3 py-3.5 mb-3 shadow-[0_2px_12px_rgba(103,43,224,0.07)]">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevWeek}
          className="w-7 h-7 rounded-lg bg-transparent text-muted text-[20px] leading-none cursor-pointer flex items-center justify-center hover:bg-primary-light hover:text-primary transition-all duration-[0.18s]"
        >
          ‹
        </button>
        <span className="text-[14px] font-semibold text-muted">
          {formatWeekRange(weekDays)}
        </span>
        <button
          onClick={onNextWeek}
          className="w-7 h-7 rounded-lg bg-transparent text-muted text-[20px] leading-none cursor-pointer flex items-center justify-center hover:bg-primary-light hover:text-primary transition-all duration-[0.18s]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const dateKey = formatDateKey(day);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedKey;
          const isSunday = day.getDay() === 0;
          const count = todos
            .filter((todo) => todo.date === dateKey)
            .filter((todo) => {
              if (currentFilter === "active") return !todo.isDone;
              if (currentFilter === "done") return todo.isDone;
              return true;
            }).length;

          return (
            <div
              key={dateKey}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg cursor-pointer border-[1.5px] transition-all duration-[0.18s] ${
                isSelected
                  ? "bg-primary border-primary hover:bg-primary-dark hover:border-primary-dark"
                  : "border-transparent hover:bg-primary-light"
              }`}
            >
              <div className="flex items-center gap-[3px]">
                <span
                  className={`text-[13px] ${
                    isSelected
                      ? "text-white"
                      : isToday
                        ? "text-primary font-bold"
                        : isSunday
                          ? "text-error"
                          : "text-muted"
                  }`}
                >
                  {DAY_NAMES[day.getDay()]}
                </span>
                {isToday && (
                  <span
                    className={`text-[10px] font-bold ${isSelected ? "text-white/80" : "text-primary"}`}
                  >
                    오늘
                  </span>
                )}
              </div>

              <span
                className={`text-[18px] font-bold w-[34px] h-[34px] flex items-center justify-center rounded-full transition-all duration-[0.18s] ${
                  isSelected
                    ? "bg-white text-primary"
                    : isSunday
                      ? "text-error"
                      : "text-[#1a1523]"
                }`}
              >
                {day.getDate()}
              </span>

              <span
                className={`text-[12px] font-semibold min-h-[14px] ${
                  count > 0
                    ? isSelected
                      ? "text-white"
                      : "text-primary"
                    : "invisible"
                }`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyView;
