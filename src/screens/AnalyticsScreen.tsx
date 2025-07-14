import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';

const chartColors = [
  '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0097a7', '#c2185b', '#ffa000', '#388e3c', '#0288d1'
];

const AnalyticsScreen = () => {
  const { expenses, categories } = useAppContext();
  // Новый фильтр по месяцу
  const [filterMonth, setFilterMonth] = useState('');
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  // Получить все уникальные месяцы из трат
  const getMonth = (dateStr: string) => dateStr.slice(0, 7); // YYYY-MM
  const months = Array.from(new Set(expenses.map(e => getMonth(e.date)))).sort().reverse();

  let filtered = expenses;
  if (filterMonth) filtered = filtered.filter(e => getMonth(e.date) === filterMonth);

  // Суммы по категориям
  const sums: { [cat: string]: number } = {};
  filtered.forEach(e => {
    if (!sums[e.category]) sums[e.category] = 0;
    sums[e.category] += e.amount;
  });

  const chartData = Object.entries(sums).map(([catId, value], i) => ({
    name: categories.find(c => c.id === catId)?.name || 'Без категории',
    amount: value,
    color: chartColors[i % chartColors.length],
    legendFontColor: '#333',
    legendFontSize: 13,
  }));

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Фильтр по месяцу */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
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
        </TouchableOpacity>
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
      {/* Общая сумма */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Общая сумма: <Text style={{ color: '#1976d2' }}>{Math.round(total)} ₸</Text>
      </Text>
      {/* Диаграмма */}
      {chartData.length > 0 ? (
        <PieChart
          data={chartData.map(d => ({
            name: d.name,
            population: d.amount,
            color: d.color,
            legendFontColor: d.legendFontColor,
            legendFontSize: d.legendFontSize,
          }))}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            color: () => '#1976d2',
            labelColor: () => '#333',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="8"
          absolute
        />
      ) : (
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
          Нет данных для отображения диаграммы
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  customPickerBtn: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1976d2',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 140,
    height: 44,
    marginBottom: 8,
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
});

export default AnalyticsScreen;
