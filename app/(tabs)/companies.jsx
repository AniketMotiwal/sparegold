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
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { auth } from './../configs/FirebaseConfig'; // Firebase config
import { useRouter } from 'expo-router';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyImage, setNewCompanyImage] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();  // Use useRouter instead of useNavigation

  useEffect(() => {
    loadCompaniesFromStorage();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        saveCurrentUser(user);
      } else {
        AsyncStorage.removeItem('currentUser');
        router.push('/auth/sign-in');  // Navigate using useRouter
      }
    });

    return () => unsubscribe();
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
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } else {
        console.log('No current user found');
        router.push('/auth/sign-in');  // Navigate using useRouter
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const getEmailPrefix = (email) => {
    return email ? email.split('@')[0] : 'Guest';
  };

  const loadCompaniesFromStorage = async () => {
    try {
      const storedCompanies = await AsyncStorage.getItem('companies');
      if (storedCompanies !== null) {
        setCompanies(JSON.parse(storedCompanies));
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
      setNewCompanyImage(result.assets[0]);
    } else {
      console.log('Image picking canceled.');
    }
  };

  const uploadImageToCloudinary = async (image) => {
    const data = new FormData();
    
    // Get MIME type from the file extension
    const mimeType = image.type || 'image/jpeg';  // Default to 'image/jpeg' if mime type is not provided

    // Create the file data for Cloudinary upload
    data.append('file', {
      uri: image.uri,
      type: mimeType,  // Use the correct mime type
      name: image.uri.split('/').pop(),  // Use the file name from URI
    });
    data.append('upload_preset', 'sparegold'); // Set your Cloudinary upload preset here

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/drevlezgz/image/upload',
        data
      );
      return response.data.secure_url; // This will be the URL of the uploaded image
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const addCompany = async () => {
    if (newCompanyName && newCompanyImage) {
      const imageUrl = await uploadImageToCloudinary(newCompanyImage);

      if (imageUrl) {
        const newCompany = {
          id: (companies.length + 1).toString(),
          name: newCompanyName,
          image: { uri: imageUrl },
        };
        const updatedCompanies = [...companies, newCompany];
        setCompanies(updatedCompanies);
        saveCompaniesToStorage(updatedCompanies);
        setNewCompanyName('');
        setNewCompanyImage(null);
        setModalVisible(false);
      } else {
        console.log('Failed to upload image');
      }
    } else {
      console.log('Please provide both company name and image.');
    }
  };

  const updateCompany = async () => {
    if (newCompanyName && newCompanyImage && selectedCompanyId !== null) {
      const imageUrl = await uploadImageToCloudinary(newCompanyImage);

      if (imageUrl) {
        const updatedCompanies = companies.map((company) =>
          company.id === selectedCompanyId
            ? { ...company, name: newCompanyName, image: { uri: imageUrl } }
            : company
        );
        setCompanies(updatedCompanies);
        saveCompaniesToStorage(updatedCompanies);
        setNewCompanyName('');
        setNewCompanyImage(null);
        setIsEditing(false);
        setSelectedCompanyId(null);
        setModalVisible(false);
      } else {
        console.log('Failed to upload image');
      }
    }
  };

  const deleteCompany = (id) => {
    const updatedCompanies = companies.filter((company) => company.id !== id);
    setCompanies(updatedCompanies);
    saveCompaniesToStorage(updatedCompanies);
    setSelectedCompanyId(null);
  };

  const handleUserProfileClick = () => {
    router.push('/profile');  // Navigate using useRouter
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Automotive Companies</Text>

      {currentUser && (
        <TouchableOpacity style={styles.userInfoContainer} onPress={handleUserProfileClick}>
          <Image
            source={{ uri: currentUser.photoURL || 'https://www.w3schools.com/w3images/avatar2.png' }}
            style={styles.userImage}
          />
          <Text style={styles.userName}>{currentUser.displayName}</Text>
          <Text style={styles.userEmail}>{getEmailPrefix(currentUser.email)}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image.uri }} style={styles.image} resizeMode="contain" />
            <Text style={styles.companyName}>{item.name}</Text>
          </TouchableOpacity>
        )}
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
            <Image source={{ uri: newCompanyImage.uri }} style={styles.previewImage} />
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
