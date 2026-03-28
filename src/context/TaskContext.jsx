/**
 * @fileoverview TaskContext — React context for task management state.
 *
 * Holds and exposes all task data (daily tasks, weekly tasks, history),
 * the current week ID, today's ISO day, and all mutation methods.
 * The concrete ITaskRepository instance is injected from main.jsx.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { getWeekId } from '../services/WeekService';
import { getIsoDay } from '../domain/enums/DayOfWeek';
import { buildWeekHistorySnapshot } from '../services/WeekService';
import { createDailyTask } from '../domain/models/DailyTask';
import { createWeeklyTask } from '../domain/models/WeeklyTask';

/** @type {React.Context<TaskContextValue>} */
const TaskContext = createContext(null);

/**
 * @typedef {Object} TaskContextValue
 * @property {import('../domain/models/DailyTask').DailyTask[]}   dailyTasks
 * @property {import('../domain/models/WeeklyTask').WeeklyTask[]}  weeklyTasks
 * @property {import('../domain/models/WeekHistory').WeekHistory[]} history
 * @property {string}  currentWeekId - e.g. "2024-W12"
 * @property {number}  todayDay      - ISO day (1=Mon…7=Sun)
 * @property {boolean} loading
 * @property {(taskData: object) => Promise<void>} addDailyTask
 * @property {(taskData: object) => Promise<void>} addWeeklyTask
 * @property {(taskId: string, day: number) => Promise<void>} toggleDailyTask
 * @property {(taskId: string, increment: boolean) => Promise<void>} toggleWeeklyTask
 * @property {(id: string) => Promise<void>} deleteTask
 */

/**
 * @param {{ children: React.ReactNode, repository: import('../repositories/ITaskRepository').ITaskRepository }} props
 */
export function TaskProvider({ children, repository }) {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentWeekId = getWeekId(now);
  const todayDay = getIsoDay(now);

  /** Initial data load and optional week-reset check. */
  useEffect(() => {
    async function load() {
      try {
        const [daily, weekly, hist] = await Promise.all([
          repository.getDailyTasks(),
          repository.getWeeklyTasks(),
          repository.getWeekHistory(),
        ]);

        // ── Week reset: if no completion data exists for currentWeekId,
        //    a new week has started. Save a snapshot of the old completions
        //    if there are any tasks with prior data, then the new week starts fresh.
        const hasCurrentWeekData =
          daily.some((t) => t.completions[currentWeekId] !== undefined) ||
          weekly.some((t) => t.completions[currentWeekId] !== undefined);

        if (!hasCurrentWeekData && (daily.length > 0 || weekly.length > 0)) {
          // Find the most recent previous weekId from completions.
          const allWeekIds = new Set();
          [...daily, ...weekly].forEach((t) =>
            Object.keys(t.completions).forEach((wid) => allWeekIds.add(wid)),
          );
          if (allWeekIds.size > 0) {
            const sortedIds = [...allWeekIds].sort().reverse();
            const prevWeekId = sortedIds[0];
            if (prevWeekId && prevWeekId !== currentWeekId) {
              const snapshot = buildWeekHistorySnapshot(daily, weekly, prevWeekId);
              const alreadySaved = hist.some((h) => h.weekId === prevWeekId);
              if (!alreadySaved) {
                await repository.saveWeekHistory(snapshot);
                hist.unshift(snapshot);
              }
            }
          }
        }

        setDailyTasks(daily);
        setWeeklyTasks(weekly);
        setHistory(hist);
      } catch (err) {
        console.error('TaskContext failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [repository, currentWeekId]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const addDailyTask = useCallback(
    async (taskData) => {
      const task = createDailyTask({ ...taskData});
      task.completions = task.completions === null ? { [currentWeekId]: [] }:task.completions;
      const {id,wasEditing} = await repository.addDailyTask(task);
      task.id = id;
      
      if (wasEditing){
        
        const temp  = dailyTasks.filter(task=>task.id !==id);
        
        setDailyTasks([...temp,task]);
        return
      }
      setDailyTasks((prev) => [...prev, task]);
    },
    [repository, currentWeekId,dailyTasks],
  );

  const addWeeklyTask = useCallback(
    async (taskData) => {
      const task = createWeeklyTask({ ...taskData});
      task.completions = task.completions === null ? { [currentWeekId]: [] }:task.completions;
      const {id,wasEditing} = await repository.addWeeklyTask(task);
      task.id = id;
      
      if (wasEditing){
        
        const temp  = weeklyTasks.filter(task=>task.id !==id);
        
        setWeeklyTasks([...temp,task]);
        return
      }
      setWeeklyTasks((prev) => [...prev, task]);

    },
    [repository, currentWeekId,weeklyTasks],
  );

  const toggleDailyTask = useCallback(
    async (taskId, day) => {
      const task = dailyTasks.find((t) => t.id === taskId);
      if (!task) return;
      const done = (task.completions[currentWeekId] ?? []).includes(day);
      if (done) {
        await repository.uncompleteDailyTask(taskId, currentWeekId, day);
      } else {
        await repository.completeDailyTask(taskId, currentWeekId, day);
      }
      setDailyTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const current = t.completions[currentWeekId] ?? [];
          const updated = done
            ? current.filter((d) => d !== day)
            : [...current, day];
          return { ...t, completions: { ...t.completions, [currentWeekId]: updated } };
        }),
      );
    },
    [dailyTasks, repository, currentWeekId],
  );

  const toggleWeeklyTask = useCallback(
    async (taskId, increment) => {
      const task = weeklyTasks.find((t) => t.id === taskId);
      if (!task) return;
      if (increment) {
        await repository.completeWeeklyTask(taskId, currentWeekId);
      } else {
        await repository.uncompleteWeeklyTask(taskId, currentWeekId);
      }
      setWeeklyTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const cur = t.completions[currentWeekId] ?? 0;
          const next = increment ? cur + 1 : Math.max(0, cur - 1);
          return { ...t, completions: { ...t.completions, [currentWeekId]: next } };
        }),
      );
    },
    [weeklyTasks, repository, currentWeekId],
  );

  const deleteTask = useCallback(
    async (id) => {
      await repository.deleteTask(id);
      setDailyTasks((prev) => prev.filter((t) => t.id !== id));
      setWeeklyTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [repository],
  );

  return (
    <TaskContext.Provider
      value={{
        dailyTasks,
        weeklyTasks,
        history,
        currentWeekId,
        todayDay,
        loading,
        addDailyTask,
        addWeeklyTask,
        toggleDailyTask,
        toggleWeeklyTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

/**
 * Custom hook for consuming TaskContext.
 * Must be used inside a <TaskProvider />.
 * @returns {TaskContextValue}
 */
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider.');
  return ctx;
}
