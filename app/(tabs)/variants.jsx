import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
const variantsData = [
  { id: '1', name: 'Tesla Model S', variant: 'Standard Range Plus', details: 'Standard Range Plus with basic features and great performance.', image: 'https://via.placeholder.com/150?text=Tesla+Model+S' },
  { id: '2', name: 'Tesla Model S', variant: 'Long Range', details: 'Long Range with extended battery life and enhanced features.', image: 'https://via.placeholder.com/150?text=Tesla+Model+S+Long+Range' },
  { id: '3', name: 'Tesla Model S', variant: 'Plaid', details: 'Plaid variant with ultimate performance and speed.', image: 'https://via.placeholder.com/150?text=Tesla+Model+S+Plaid' },
  { id: '4', name: 'BMW 3 Series', variant: 'Base Model', details: 'Base Model with standard equipment and great fuel economy.', image: 'https://via.placeholder.com/150?text=BMW+3+Series' },
  { id: '5', name: 'BMW 3 Series', variant: 'Sport', details: 'Sport variant with sportier suspension and styling.', image: 'https://via.placeholder.com/150?text=BMW+3+Series+Sport' },
  { id: '6', name: 'BMW 3 Series', variant: 'M3', details: 'M3 performance model with advanced performance tuning.', image: 'https://via.placeholder.com/150?text=BMW+M3' },
  { id: '7', name: 'Jaguar F-Type', variant: 'XE', details: 'XE variant with the base engine and luxury features.', image: 'https://via.placeholder.com/150?text=Jaguar+F-Type+XE' },
  { id: '8', name: 'Jaguar F-Type', variant: 'R-Dynamic', details: 'R-Dynamic with more power and sportier styling.', image: 'https://via.placeholder.com/150?text=Jaguar+F-Type+R-Dynamic' },
  { id: '9', name: 'Jaguar F-Type', variant: 'SVR', details: 'SVR with the highest performance and racing-inspired design.', image: 'https://via.placeholder.com/150?text=Jaguar+F-Type+SVR' },
];
export default function Variants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', variant: '', details: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Load saved variants from AsyncStorage
  const loadVariants = async () => {
    try {
      const savedVariants = await AsyncStorage.getItem('variants');
      if (savedVariants !== null) {
        setVariants(JSON.parse(savedVariants));
      } else {
        setVariants(variantsData); // Use default data if no saved data
      }
    } catch (error) {
      console.error("Failed to load variants from AsyncStorage", error);
    }
  };

  useEffect(() => {
    loadVariants();
  }, []);

  // Save variants to AsyncStorage
  const saveVariants = async (variants) => {
    try {
      await AsyncStorage.setItem('variants', JSON.stringify(variants));
    } catch (error) {
      console.error("Failed to save variants to AsyncStorage", error);
    }
  };

  // Handle image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewVariant({ ...newVariant, image: result.assets[0].uri });
    }
  };

  // Filter variants based on search query
  const filteredVariants = variants.filter(variant =>
    variant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    variant.variant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new variant
  const handleAddVariant = () => {
    if (newVariant.name && newVariant.variant && newVariant.details && newVariant.image) {
      const updatedVariants = [...variants, { id: (variants.length + 1).toString(), ...newVariant }];
      setVariants(updatedVariants);
      saveVariants(updatedVariants); // Save to AsyncStorage
      setModalVisible(false);
      setNewVariant({ name: '', variant: '', details: '', image: '' });
      Alert.alert('Success', 'Variant added successfully');
    } else {
      Alert.alert('Error', 'Please fill in all fields and select an image');
    }
  };

  // Edit existing variant
  const handleEditVariant = () => {
    if (newVariant.name && newVariant.variant && newVariant.details && newVariant.image) {
      const updatedVariants = variants.map((variant) =>
        variant.id === newVariant.id ? { ...variant, ...newVariant } : variant
      );
      setVariants(updatedVariants);
      saveVariants(updatedVariants); // Save to AsyncStorage
      setModalVisible(false);
      setNewVariant({ name: '', variant: '', details: '', image: '' });
      setIsEditing(false);
      Alert.alert('Success', 'Variant updated successfully');
    } else {
      Alert.alert('Error', 'Please fill in all fields and select an image');
    }
  };

  // Delete variant
  const handleDeleteVariant = (id) => {
    const updatedVariants = variants.filter(variant => variant.id !== id);
    setVariants(updatedVariants);
    saveVariants(updatedVariants); // Save to AsyncStorage
    Alert.alert('Success', 'Variant deleted successfully');
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={24} color="#00796b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search variants"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Variant Cards */}
      <FlatList
        data={filteredVariants}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.variantCard}>
            <Image source={{ uri: item.image }} style={styles.variantImage} />
            <Text style={styles.variantName}>{item.variant}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => { setNewVariant(item); setIsEditing(true); setModalVisible(true); }}>
                <Icon name="edit" size={24} color="#00796b" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteVariant(item.id)}>
                <Icon name="delete" size={24} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add New Variant Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => { setIsEditing(false); setModalVisible(true); }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Variant Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Variant' : 'Add New Variant'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Model Name"
              value={newVariant.name}
              onChangeText={(text) => setNewVariant({ ...newVariant, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Variant Name"
              value={newVariant.variant}
              onChangeText={(text) => setNewVariant({ ...newVariant, variant: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Details"
              value={newVariant.details}
              onChangeText={(text) => setNewVariant({ ...newVariant, details: text })}
            />
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Text style={styles.imagePickerText}>Pick an Image</Text>
            </TouchableOpacity>
            {newVariant.image ? (
              <Image source={{ uri: newVariant.image }} style={styles.imagePreview} />
            ) : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={isEditing ? handleEditVariant : handleAddVariant}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  variantCard: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  variantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00796b',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#00796b',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 15,
  },
  input: {
    height: 45,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#00796b',
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  variantDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 10,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
  },
});
