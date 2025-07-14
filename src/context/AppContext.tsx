import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
};

export type Category = {
  id: string;
  name: string;
};

type AppContextType = {
  expenses: Expense[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  editCategory: (id: string, name: string) => void;
  editExpense: (id: string, updated: Omit<Expense, 'id'>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Продукты' },
  { id: '2', name: 'Транспорт' },
  { id: '3', name: 'Кафе' },
  { id: '4', name: 'Развлечения' },
  { id: '5', name: 'Одежда' },
  { id: '6', name: 'Интернет' },
  { id: '7', name: 'Связь' },
  { id: '8', name: 'Прочее' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Загрузка из AsyncStorage
  useEffect(() => {
    (async () => {
      const exp = await AsyncStorage.getItem('expenses');
      const cat = await AsyncStorage.getItem('categories');
      if (exp) setExpenses(JSON.parse(exp));
      if (cat) setCategories(JSON.parse(cat));
    })();
  }, []);

  // Сохранение в AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    AsyncStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [
      ...prev,
      { ...expense, id: Date.now().toString() },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addCategory = (name: string) => {
    if (!name.trim() || categories.some(c => c.name === name.trim())) return;
    setCategories(prev => [
      ...prev,
      { id: Date.now().toString(), name: name.trim() },
    ]);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setExpenses(prev => prev.map(e => e.category === id ? { ...e, category: '' } : e));
  };

  const editCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const editExpense = (id: string, updated: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated, id } : e));
  };

  return (
    <AppContext.Provider value={{ expenses, categories, addExpense, removeExpense, addCategory, removeCategory, editCategory, editExpense }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
