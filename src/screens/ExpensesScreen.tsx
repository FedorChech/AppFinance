import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const getMonth = (dateStr: string) => dateStr.slice(0, 7); // YYYY-MM

const ExpensesScreen = () => {
  const { expenses, categories, addExpense, removeExpense, editExpense } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Фильтрация и сортировка
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // Получить все уникальные месяцы из трат
  const months = Array.from(new Set(expenses.map(e => getMonth(e.date)))).sort().reverse();

  let filtered = expenses;
  if (filterCategory) filtered = filtered.filter(e => e.category === filterCategory);
  if (filterMonth) filtered = filtered.filter(e => getMonth(e.date) === filterMonth);
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'date') {
      if (sortDir === 'desc') return b.date.localeCompare(a.date);
      return a.date.localeCompare(b.date);
    } else {
      if (sortDir === 'desc') return b.amount - a.amount;
      return a.amount - b.amount;
    }
  });

  const openEdit = (item: any) => {
    setEditId(item.id);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setDate(item.date);
    setDescription(item.description || '');
    setModalVisible(true);
  };

  const handleAddOrEdit = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    if (!category) {
      Alert.alert('Ошибка', 'Выберите категорию');
      return;
    }
    if (editId) {
      editExpense(editId, {
        amount: parseFloat(amount),
        category,
        date,
        description,
      });
    } else {
      addExpense({
        amount: parseFloat(amount),
        category,
        date,
        description,
      });
    }
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setEditId(null);
    setModalVisible(false);
  };

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  // Сортировка категорий по частоте использования (useMemo)
  const sortedCategories = useMemo(() => {
    const usage = categories.map(cat => ({
      ...cat,
      count: expenses.filter(e => e.category === cat.id).length,
    }));
    return usage.sort((a, b) => b.count - a.count);
  }, [expenses, categories]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Фильтры */}
      <View style={styles.filterBlock}>
        <Text style={styles.blockTitle}>Фильтр по категориям и дате</Text>
        <View style={styles.centeredRow}>
          <TouchableOpacity
            style={styles.customPickerBtn}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#1976d2', fontSize: 15 }}>
              {filterCategory
                ? categories.find(c => c.id === filterCategory)?.name || 'Категория'
                : 'Все категории'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#1976d2" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        {/* Модальное окно выбора категории */}
        <Modal
          visible={categoryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setCategoryModalVisible(false)}>
            <View style={styles.modalDropdown}>
              <FlatList
                data={[{ id: '', name: 'Все категории' }, ...categories]}
                keyExtractor={item => item.id || 'all'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFilterCategory(item.id);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, color: filterCategory === item.id ? '#1976d2' : '#222' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        <View style={styles.centeredRow}>
          <TouchableOpacity
            style={styles.customPickerBtn}
            onPress={() => setMonthModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#1976d2', fontSize: 15 }}>
              {filterMonth
                ? months.find(m => m === filterMonth)?.replace('-', '.') || 'Месяц'
                : 'Все месяцы'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#1976d2" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        {/* Модальное окно выбора месяца */}
        <Modal
          visible={monthModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMonthModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setMonthModalVisible(false)}>
            <View style={styles.modalDropdown}>
              <FlatList
                data={[{ id: '', name: 'Все месяцы' }, ...months.map(m => ({ id: m, name: m.replace('-', '.') }))]}
                keyExtractor={item => item.id || 'all'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFilterMonth(item.id);
                      setMonthModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, color: filterMonth === item.id ? '#1976d2' : '#222' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Сортировка */}
      <View style={styles.sortBlock}>
        <Text style={styles.blockTitle}>Сортировка</Text>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'date' && styles.sortBtnActive]}
          onPress={() => setSortBy('date')}
        >
          <Ionicons name="calendar" size={18} color={sortBy === 'date' ? '#fff' : '#1976d2'} />
          <Text style={{ color: sortBy === 'date' ? '#fff' : '#1976d2', marginLeft: 4 }}>Дата</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'amount' && styles.sortBtnActive]}
          onPress={() => setSortBy('amount')}
        >
          <Ionicons name="cash" size={18} color={sortBy === 'amount' ? '#fff' : '#1976d2'} />
          <Text style={{ color: sortBy === 'amount' ? '#fff' : '#1976d2', marginLeft: 4 }}>Сумма</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortDirBtn}
          onPress={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
        >
          <Ionicons name={sortDir === 'desc' ? 'arrow-down' : 'arrow-up'} size={18} color="#1976d2" />
        </TouchableOpacity>
        </View>
      </View>

      {filtered.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>
          Нет трат по выбранным фильтрам.
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <View>
                <Text style={styles.expenseAmount}>{Math.round(item.amount)} ₸</Text>
                <Text style={styles.expenseCategory}>{categories.find(c => c.id === item.category)?.name || '—'}</Text>
                <Text style={styles.expenseDate}>{item.date}</Text>
                {item.description ? <Text style={styles.expenseDesc}>{item.description}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 12 }}>
                  <Ionicons name="create-outline" size={22} color="#1976d2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  Alert.alert(
                    'Удалить трату?',
                    'Вы действительно хотите удалить эту трату?',
                    [
                      { text: 'Отмена', style: 'cancel' },
                      { text: 'Удалить', style: 'destructive', onPress: () => removeExpense(item.id) },
                    ]
                  );
                }}>
                  <Ionicons name="trash" size={22} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          setEditId(null);
          setAmount('');
          setCategory('');
          setDate(new Date().toISOString().slice(0, 10));
          setDescription('');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setEditId(null);
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editId ? 'Редактировать трату' : 'Новая трата'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Сумма в тенге"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text style={{ marginBottom: 4 }}>Категория</Text>
              <View style={styles.categoryPicker}>
                {sortedCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryBtn, category === cat.id && styles.categoryBtnActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={{ color: category === cat.id ? '#fff' : '#1976d2' }}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ marginBottom: 4, marginTop: 8 }}>Дата</Text>
              <TextInput
                style={styles.input}
                placeholder="Дата"
                value={date}
                onChangeText={setDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Описание (необязательно)"
                value={description}
                onChangeText={setDescription}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalBtn} onPress={handleAddOrEdit}>
                  <Text style={{ color: '#1976d2' }}>{editId ? 'Сохранить' : 'Добавить'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtn} onPress={() => {
                  setEditId(null);
                  setModalVisible(false);
                }}>
                  <Text style={{ color: '#d32f2f' }}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filterBtnText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  filterBtn: {
    borderWidth: 1.5,
    borderColor: '#1976d2',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 6,
    minHeight: 38,
  },
  filterBtnActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  sortBtnActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  sortDirBtn: {
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 16,
    padding: 4,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#1976d2',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#555',
  },
  expenseDate: {
    fontSize: 12,
    color: '#888',
  },
  expenseDesc: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryBtn: {
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryBtnActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    marginLeft: 16,
  },
  filterBlock: {
    backgroundColor: '#e3f0fc',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sortBlock: {
    backgroundColor: '#f5f7fa',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 14,
    elevation: 1,
  },
  blockTitle: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  customPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1976d2',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 140,
    height: 44,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minWidth: 220,
    maxHeight: 320,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
});

export default ExpensesScreen;
