import { useState } from "react";
import { getWeekDays } from "../utils/date";

function useDateNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekAnchor, setWeekAnchor] = useState(new Date());

  function goToPrevDate() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }

  function goToNextDate() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  }

  function goToPrevWeek() {
    setWeekAnchor((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function goToNextWeek() {
    setWeekAnchor((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  return {
    currentDate,
    selectDate: setCurrentDate,
    goToPrevDate,
    goToNextDate,
    weekDays: getWeekDays(weekAnchor),
    goToPrevWeek,
    goToNextWeek,
  };
}

export default useDateNavigation;
