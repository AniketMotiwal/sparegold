import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Importing icons for edit and delete
import * as ImagePicker from 'expo-image-picker'; // Import the image picker library
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for local storage
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './../configs/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';

const dummyCompanies = [
  { id: '1', name: 'Hyunda', image: require('../../assets/images/hyundai.png') },
  { id: '2', name: 'Maruti', image: require('../../assets/images/maruti.png') },
  { id: '3', name: 'Tata', image: require('../../assets/images/Tata.png') },
  { id: '4', name: 'Kia', image: require('../../assets/images/kia.png') },
  { id: '5', name: 'BMW', image: require('../../assets/images/bmw.png') },
  { id: '6', name: 'Mercedes', image: require('../../assets/images/mercedes.png') },
  { id: '7', name: 'Ford', image: require('../../assets/images/ford.png') },
  { id: '8', name: 'Honda', image: require('../../assets/images/honda.png') },
  { id: '9', name: 'Audi', image: require('../../assets/images/audi.png') },
  { id: '10', name: 'Volkswagen', image: require('../../assets/images/volkswagen.png') },
];

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyImage, setNewCompanyImage] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Track current user
  const navigation = useNavigation(); // Hook for navigation

  useEffect(() => {
    loadCompaniesFromStorage();
    loadCurrentUser();
  }, []);
  useEffect(() => {
    const auth = getAuth(); // Initialize Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        saveCurrentUser(user); // Save user to AsyncStorage if signed in
      } else {
        AsyncStorage.removeItem('currentUser');
        navigation.navigate('auth/sign-in'); // Navigate to the login screen if no user is signed in
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);


  const saveCompaniesToStorage = async (data) => {
    try {
      await AsyncStorage.setItem('companies', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving companies:', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser !== null) {
        setCurrentUser(JSON.parse(storedUser)); // Set user in state if found
      } else {
        console.log('No current user found');
        navigation.navigate('auth/sign-in');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadCompaniesFromStorage = async () => {
    try {
      const storedCompanies = await AsyncStorage.getItem('companies');
      if (storedCompanies !== null) {
        setCompanies(JSON.parse(storedCompanies));
      } else {
        setCompanies(dummyCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };
  const saveCurrentUser = async (user) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewCompanyImage(result.assets[0].uri);
    } else {
      console.log('Image picking canceled.');
    }
  };

  const addCompany = () => {
    if (newCompanyName && newCompanyImage) {
      const newCompany = {
        id: (companies.length + 1).toString(),
        name: newCompanyName,
        image: { uri: newCompanyImage },
      };
      const updatedCompanies = [...companies, newCompany];
      setCompanies(updatedCompanies);
      saveCompaniesToStorage(updatedCompanies);
      setNewCompanyName('');
      setNewCompanyImage(null);
      setModalVisible(false);
    } else {
      console.log('Please provide both company name and image.');
    }
  };

  const updateCompany = () => {
    if (newCompanyName && newCompanyImage && selectedCompanyId !== null) {
      const updatedCompanies = companies.map((company) =>
        company.id === selectedCompanyId
          ? { ...company, name: newCompanyName, image: { uri: newCompanyImage } }
          : company
      );
      setCompanies(updatedCompanies);
      saveCompaniesToStorage(updatedCompanies);
      setNewCompanyName('');
      setNewCompanyImage(null);
      setIsEditing(false);
      setSelectedCompanyId(null);
      setModalVisible(false);
    }
  };

  const deleteCompany = (id) => {
    const updatedCompanies = companies.filter((company) => company.id !== id);
    setCompanies(updatedCompanies);
    saveCompaniesToStorage(updatedCompanies);
    setSelectedCompanyId(null);
  };

  const gridData =
    companies.length % 2 === 0
      ? companies
      : [...companies, { id: 'placeholder', name: '', image: null }];

      const handleUserProfileClick = () => {
        // Navigate to profile page
        navigation.navigate('/profile');
      };
    
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Automotive Companies</Text>
  {/* Display the current user's info */}
      {currentUser && (
        <TouchableOpacity style={styles.userInfoContainer} onPress={handleUserProfileClick}>
          <Image
            source={{ uri: currentUser.photoURL || 'https://www.w3schools.com/w3images/avatar2.png' }} // Default image if no photo
            style={styles.userImage}
          />
          <Text style={styles.userEmail}>{currentUser.email}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={gridData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) =>
          item.name ? (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                if (selectedCompanyId === item.id) {
                  setSelectedCompanyId(null);
                  setIsEditing(false);
                } else {
                  setSelectedCompanyId(item.id);
                  setNewCompanyName(item.name);
                  setNewCompanyImage(item.image.uri);
                  setIsEditing(false);
                }
              }}
            >
              <Image source={item.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.companyName}>{item.name}</Text>

              {selectedCompanyId === item.id && !isEditing && (
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      setIsEditing(true);
                      setModalVisible(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={24} color="blue" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => deleteCompany(item.id)}
                  >
                    <MaterialIcons name="delete" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, { backgroundColor: 'transparent', elevation: 0 }]} />
          )
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setModalVisible(true);
          setIsEditing(false);
          setNewCompanyName('');
          setNewCompanyImage(null);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalHeader}>
            {isEditing ? 'Update Company' : 'Add New Company'}
          </Text>
          <TextInput
            placeholder="Company Name"
            style={styles.input}
            value={newCompanyName}
            onChangeText={(text) => setNewCompanyName(text)}
          />

          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>Pick an Image</Text>
          </TouchableOpacity>

          {newCompanyImage && (
            <Image source={{ uri: newCompanyImage }} style={styles.previewImage} />
          )}

          <Button
            title={isEditing ? 'Save Changes' : 'Add Company'}
            onPress={isEditing ? updateCompany : addCompany}
          />
          <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 5,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  iconButton: {
    marginHorizontal: -10,
    padding: 5,
  },
  addButton: {
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    elevation: 2,
  },
  imagePickerButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  imagePickerText: {
    color: '#fff',
    textAlign: 'center',
  },
  previewImage: {
    width: 200, // Make sure the width is enough to display the image
    height: 200, // Set an appropriate height for preview
    marginVertical: 10,
    borderRadius: 8,
  },
  userEmail: {
    fontSize: 16,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
