import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Button,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function Models() {
  const [search, setSearch] = useState('');
  const [models, setModels] = useState([]);
  const [originalModels, setOriginalModels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', company: '', year: '', details: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      const storedModels = await AsyncStorage.getItem('carModels');
      if (storedModels) {
        const parsedModels = JSON.parse(storedModels);
        setOriginalModels(parsedModels);
        setModels(parsedModels);
      } else {
        setOriginalModels(carData);
        setModels(carData);
      }
    };

    loadModels();
  }, []);

  const saveModelsToLocalStorage = async (models) => {
    await AsyncStorage.setItem('carModels', JSON.stringify(models));
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.trim() === '') {
      setModels(originalModels);
    } else {
      const filteredModels = originalModels.filter((car) =>
        car.name.toLowerCase().includes(text.toLowerCase())
      );
      setModels(filteredModels);
    }
  };

  const handleAddModel = async () => {
    if (!newModel.name || !newModel.company || !newModel.year || !newModel.details) {
      alert('Please fill all fields.');
      return;
    }

    let updatedModels;
    if (isEditing) {
      updatedModels = originalModels.map((model) =>
        model.id === editId ? { ...model, ...newModel } : model
      );
    } else {
      updatedModels = [
        ...originalModels,
        { ...newModel, id: (originalModels.length + 1).toString() },
      ];
    }

    setOriginalModels(updatedModels);
    setModels(updatedModels);
    saveModelsToLocalStorage(updatedModels);
    setNewModel({ name: '', company: '', year: '', details: '', image: '' });
    setIsEditing(false);
    setModalVisible(false);
  };

  const handleEditModel = (id) => {
    const modelToEdit = models.find((model) => model.id === id);
    setNewModel(modelToEdit);
    setIsEditing(true);
    setEditId(id);
    setModalVisible(true);
  };

  const handleDeleteModel = async (id) => {
    const updatedModels = originalModels.filter((model) => model.id !== id);
    setOriginalModels(updatedModels);
    setModels(updatedModels);
    saveModelsToLocalStorage(updatedModels);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setNewModel({ ...newModel, image: result.assets[0].uri });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Car Models</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Search Models..."
              value={search}
              onChangeText={handleSearch}
            />
          </View>
        )}
        data={models}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={typeof item.image === 'string' ? { uri: item.image } : item.image}  
              style={styles.image}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Company: {item.company}</Text>
              <Text style={styles.cardSubtitle}>Year: {item.year}</Text>
              <Text style={styles.cardDetails}>{item.details}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEditModel(item.id)}>
                <Ionicons name="pencil" size={24} color="blue" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteModel(item.id)}>
                <Ionicons name="trash" size={24} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setNewModel({ name: '', company: '', year: '', details: '', image: '' });
              setModalVisible(true);
              setIsEditing(false);
            }}
          >
            <Text style={styles.addButtonText}>Add New Model</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit' : 'Add'} Car Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Model Name"
            value={newModel.name}
            onChangeText={(text) => setNewModel({ ...newModel, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            value={newModel.company}
            onChangeText={(text) => setNewModel({ ...newModel, company: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Year"
            keyboardType="numeric"
            value={newModel.year.toString()}
            onChangeText={(text) => setNewModel({ ...newModel, year: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Details"
            value={newModel.details}
            onChangeText={(text) => setNewModel({ ...newModel, details: text })}
          />
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerButtonText}>Pick an Image</Text>
          </TouchableOpacity>
          {newModel.image ? (
            <Image source={{ uri: newModel.image }} style={styles.previewImage} />
          ) : null}
          <Button title="Save" onPress={handleAddModel} />
          <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: 120,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardDetails: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    justifyContent: 'space-around',
  },
  icon: {
    marginBottom: 8,
  },
  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: 'blue',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  imagePickerButton: {
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
