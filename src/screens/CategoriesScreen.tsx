import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const CategoriesScreen = () => {
  const { categories, addCategory, removeCategory, editCategory } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const openEdit = (item: any) => {
    setEditId(item.id);
    setNewCategory(item.name);
    setModalVisible(true);
  };

  const handleAddOrEdit = () => {
    if (editId) {
      editCategory(editId, newCategory);
    } else {
      addCategory(newCategory);
    }
    setNewCategory('');
    setEditId(null);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Удалён TouchableOpacity с надписью 'Добавить категорию' */}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 12 }}>
                <Ionicons name="create-outline" size={22} color="#1976d2" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Удалить категорию?',
                    `Вы действительно хотите удалить категорию "${item.name}"?\nВсе траты с этой категорией останутся, но категория будет удалена.`,
                    [
                      { text: 'Отмена', style: 'cancel' },
                      { text: 'Удалить', style: 'destructive', onPress: () => removeCategory(item.id) },
                    ]
                  );
                }}
              >
                <Ionicons name="trash" size={22} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          setEditId(null);
          setNewCategory('');
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Редактировать категорию' : 'Новая категория'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Название категории"
              value={newCategory}
              onChangeText={setNewCategory}
              autoFocus
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
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  categoryText: {
    fontSize: 16,
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
    width: '80%',
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
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    marginLeft: 16,
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
});

export default CategoriesScreen;
