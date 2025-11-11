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
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const STORAGE_KEY = '@schedule_items';

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    loadScheduleItems();
  }, []);

  const loadScheduleItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setScheduleItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load schedule items:', error);
    }
  };

  const saveScheduleItems = async (items: ScheduleItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save schedule items:', error);
    }
  };

  const addEvent = useCallback((event: Omit<Event, 'id' | 'type'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'event',
    };
    setScheduleItems((prev) => {
      const updatedItems = [...prev, newEvent];
      saveScheduleItems(updatedItems);
      return updatedItems;
    });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'type' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'task',
      completed: false,
    };
    setScheduleItems((prev) => {
      const updatedItems = [...prev, newTask];
      saveScheduleItems(updatedItems);
      return updatedItems;
    });
  }, []);

  const addUnavailablePeriod = useCallback((period: Omit<UnavailablePeriod, 'id' | 'type'>) => {
    const newPeriod: UnavailablePeriod = {
      ...period,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'unavailable',
    };
    setScheduleItems((prev) => {
      const updatedItems = [...prev, newPeriod];
      saveScheduleItems(updatedItems);
      return updatedItems;
    });
  }, []);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setScheduleItems((prev) => {
      const updatedItems = prev.map((item) => {
        if (item.id === taskId && item.type === 'task') {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      saveScheduleItems(updatedItems);
      return updatedItems;
    });
  }, []);

  const deleteScheduleItem = useCallback((itemId: string) => {
    setScheduleItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== itemId);
      saveScheduleItems(updatedItems);
      return updatedItems;
    });
  }, []);

  const value = useMemo(
    () => ({
      scheduleItems,
      addEvent,
      addTask,
      addUnavailablePeriod,
      toggleTaskComplete,
      deleteScheduleItem,
    }),
    [scheduleItems, addEvent, addTask, addUnavailablePeriod, toggleTaskComplete, deleteScheduleItem]
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
