import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Event {
  id: string;
  type: 'event';
  title: string;
  date: string;
  time: string;
  duration: number;
  location?: string;
  description?: string;
}

export interface Task {
  id: string;
  type: 'task';
  title: string;
  date: string;
  time?: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  completed: boolean;
}

export interface UnavailablePeriod {
  id: string;
  type: 'unavailable';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  durationType: 'full-day' | 'partial-day' | 'date-range';
  reason?: string;
}

export type ScheduleItem = Event | Task | UnavailablePeriod;

interface ScheduleContextType {
  scheduleItems: ScheduleItem[];
  addEvent: (event: Omit<Event, 'id' | 'type'>) => void;
  addTask: (task: Omit<Task, 'id' | 'type' | 'completed'>) => void;
  addUnavailablePeriod: (period: Omit<UnavailablePeriod, 'id' | 'type'>) => void;
  toggleTaskComplete: (taskId: string) => void;
  deleteScheduleItem: (itemId: string) => void;
  isTimeUnavailable: (userId: string, date: string, time: string) => boolean;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEY = '@schedule_items';

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadScheduleItems = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && stored !== 'ok' && stored !== 'null') {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setScheduleItems(parsed);
            }
          } catch (parseError) {
            console.error('Failed to parse schedule items, clearing storage:', parseError);
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load schedule items:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadScheduleItems();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const saveScheduleItems = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleItems));
        } catch (error) {
          console.error('Failed to save schedule items:', error);
        }
      };
      saveScheduleItems();
    }
  }, [scheduleItems, isInitialized]);

  const addEvent = useCallback((event: Omit<Event, 'id' | 'type'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'event',
    };
    setScheduleItems((prev) => [...prev, newEvent]);
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'type' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'task',
      completed: false,
    };
    setScheduleItems((prev) => [...prev, newTask]);
  }, []);

  const addUnavailablePeriod = useCallback((period: Omit<UnavailablePeriod, 'id' | 'type'>) => {
    const newPeriod: UnavailablePeriod = {
      ...period,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'unavailable',
    };
    setScheduleItems((prev) => [...prev, newPeriod]);
  }, []);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setScheduleItems((prev) => 
      prev.map((item) => {
        if (item.id === taskId && item.type === 'task') {
          return { ...item, completed: !item.completed };
        }
        return item;
      })
    );
  }, []);

  const deleteScheduleItem = useCallback((itemId: string) => {
    setScheduleItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const isTimeUnavailable = useCallback((userId: string, date: string, time: string) => {
    const unavailablePeriods = scheduleItems.filter(
      (item): item is UnavailablePeriod => item.type === 'unavailable'
    );

    for (const period of unavailablePeriods) {
      const periodStart = new Date(period.startDate);
      const periodEnd = period.endDate ? new Date(period.endDate) : periodStart;
      const checkDate = new Date(date);

      if (checkDate >= periodStart && checkDate <= periodEnd) {
        if (period.durationType === 'full-day') {
          return true;
        }

        if (period.durationType === 'partial-day' && period.startTime && period.endTime) {
          const [checkHour, checkMinute] = time.split(':').map(Number);
          const [startHour, startMinute] = period.startTime.split(':').map(Number);
          const [endHour, endMinute] = period.endTime.split(':').map(Number);

          const checkMinutes = checkHour * 60 + checkMinute;
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;

          if (checkMinutes >= startMinutes && checkMinutes < endMinutes) {
            return true;
          }
        }
      }
    }

    return false;
  }, [scheduleItems]);

  const value = useMemo(
    () => ({
      scheduleItems,
      addEvent,
      addTask,
      addUnavailablePeriod,
      toggleTaskComplete,
      deleteScheduleItem,
      isTimeUnavailable,
    }),
    [scheduleItems, addEvent, addTask, addUnavailablePeriod, toggleTaskComplete, deleteScheduleItem, isTimeUnavailable]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
