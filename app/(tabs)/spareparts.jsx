import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Image, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";

export default function App() {
  const [spareParts, setSpareParts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newSparePart, setNewSparePart] = useState({
    carName: "",
    brand: "",
    carMake: "",
    spareName: "",
    year: "",
    price: "",
    image: null,
  });
  const [newBooking, setNewBooking] = useState({
    customerName: "",
    address: "",
    mobile: "",
    spareName: "",
    carName: "",
    carMake: "",
    price: "",
  });

  // Fetch data from AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      const storedSpareParts = await AsyncStorage.getItem("spareParts");
      const storedBookings = await AsyncStorage.getItem("Available spre parts ");
      if (storedSpareParts) setSpareParts(JSON.parse(storedSpareParts));

    };
    fetchData();
  }, []);

  // Save data to AsyncStorage
  useEffect(() => {
    const saveData = async () => {
      await AsyncStorage.setItem("spareParts", JSON.stringify(spareParts));
      await AsyncStorage.setItem("bookings", JSON.stringify(bookings));
    };
    saveData();
  }, [spareParts, bookings]);

  // Add spare part
  const handleAddSparePart = () => {
    if (Object.values(newSparePart).some((field) => field === "")) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    setSpareParts([...spareParts, newSparePart]);
    setNewSparePart({
      carName: "",
      brand: "",
      carMake: "",
      spareName: "",
      year: "",
      price: "",
      image: null,
    });
    setShowAddForm(false);
  };

  // Book spare part
  const handleBookSparePart = () => {
    if (Object.values(newBooking).some((field) => field === "")) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    setBookings([...bookings, newBooking]);
    Alert.alert("Booking Confirmed", "Your booking is confirmed!");
    setNewBooking({
      customerName: "",
      address: "",
      mobile: "",
      spareName: "",
      carName: "",
      carMake: "",
      price: "",
    });
    setShowBookingForm(false);
  };

  // Edit spare part
  const handleEditSparePart = (index) => {
    const editedPart = spareParts[index];
    setNewSparePart(editedPart);
    setShowAddForm(true);
    setSpareParts(spareParts.filter((_, i) => i !== index));
  };

  // Delete spare part
  const handleDeleteSparePart = (index) => {
    setSpareParts(spareParts.filter((_, i) => i !== index));
  };

  // Cancel Add Spare Part
  const handleCancelAddSparePart = () => {
    setShowAddForm(false);
    setNewSparePart({
      carName: "",
      brand: "",
      carMake: "",
      spareName: "",
      year: "",
      price: "",
      image: null,
    });
  };

  // Cancel Booking Form
  const handleCancelBookingForm = () => {
    setShowBookingForm(false);
    setNewBooking({
      customerName: "",
      address: "",
      mobile: "",
      spareName: "",
      carName: "",
      carMake: "",
      price: "",
    });
  };
  const calculateTotalPrice = (basePrice) => {
    const gst = 0.09 * basePrice;  // 9% GST
    const cgst = 0.04 * basePrice; // 4% CGST
    const totalPrice = basePrice + gst + cgst;  // Base Price + GST + CGST
    return totalPrice.toFixed(2); // Return the total price formatted to 2 decimal places
  };
  
  const handleGenerateReceipt = async (booking) => {
    const basePrice = parseFloat(booking.price);
    const totalPrice = calculateTotalPrice(basePrice);  // Calculate total price with GST and CGST
  
    const receiptHTML = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; color: #333; padding: 20px;">
          <h1 style="text-align: center; color: #4CAF50;">Spare Gold</h1>
          <h2 style="text-align: center; color: #666;">Receipt</h2>
          <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td><strong>Customer Name:</strong></td><td>${booking.customerName}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td><td>${booking.address}</td>
            </tr>
            <tr>
              <td><strong>Mobile:</strong></td><td>${booking.mobile}</td>
            </tr>
            <tr>
              <td><strong>Spare Name:</strong></td><td>${booking.spareName}</td>
            </tr>
            <tr>
              <td><strong>Car Name:</strong></td><td>${booking.carName}</td>
            </tr>
            <tr>
              <td><strong>Car Make:</strong></td><td>${booking.carMake}</td>
            </tr>
            <tr>
              <td><strong>Price:</strong></td><td>₹${booking.price}</td>
            </tr>
            <tr>
              <td><strong>GST (9%):</strong></td><td>₹${(0.09 * basePrice).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>CGST (4%):</strong></td><td>₹${(0.04 * basePrice).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total:</strong></td><td>₹${totalPrice}</td>
            </tr>
            <tr>
              <td><strong>Warranty:</strong></td><td>1 Year</td>
            </tr>
          </table>
          <p style="margin-top: 20px; text-align: center; color: #999;">Thank you for booking with us! We hope to serve you again.</p>
          <footer style="text-align: center; margin-top: 20px; color: #ccc;">
            <p>Terms and Conditions: All parts come with a 1-year warranty. GST and CGST are applicable as per the government rules.</p>
          </footer>
        </body>
      </html>
    `;
    await Print.printAsync({ html: receiptHTML });
  };
  

  // Pick an image for spare part
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    });
    if (!result.canceled) {
      setNewSparePart({ ...newSparePart, image: result.assets[0].uri });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Add Spare Part" onPress={() => setShowAddForm(true)} />
        <Button title="Book Spare Part" onPress={() => setShowBookingForm(true)} color="green" />
      </View>

      {showAddForm && (
        <View style={styles.form}>
          <TextInput
            placeholder="Car Name"
            value={newSparePart.carName}
            onChangeText={(text) => setNewSparePart({ ...newSparePart, carName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Brand"
            value={newSparePart.brand}
            onChangeText={(text) => setNewSparePart({ ...newSparePart, brand: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Car Make"
            value={newSparePart.carMake}
            onChangeText={(text) => setNewSparePart({ ...newSparePart, carMake: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Spare Name"
            value={newSparePart.spareName}
            onChangeText={(text) => setNewSparePart({ ...newSparePart, spareName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Year"
            value={newSparePart.year}
            onChangeText={(text) => setNewSparePart({ ...newSparePart, year: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            value={newSparePart.price}
            onChangeText={(text) => setNewSparePart({ ...newSparePart, price: text })}
            style={styles.input}
          />
          <Button title="Pick Image" onPress={pickImage} />
          {newSparePart.image && <Image source={{ uri: newSparePart.image }} style={styles.image} />}
          <Button title="Save" onPress={handleAddSparePart} />
          <Button title="Cancel" onPress={handleCancelAddSparePart} color="red" />
        </View>
      )}

      {showBookingForm && (
        <View style={styles.form}>
          <TextInput
            placeholder="Customer Name"
            value={newBooking.customerName}
            onChangeText={(text) => setNewBooking({ ...newBooking, customerName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Address"
            value={newBooking.address}
            onChangeText={(text) => setNewBooking({ ...newBooking, address: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Mobile"
            value={newBooking.mobile}
            onChangeText={(text) => setNewBooking({ ...newBooking, mobile: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Spare Part Name"
            value={newBooking.spareName}
            onChangeText={(text) => setNewBooking({ ...newBooking, spareName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Car Name"
            value={newBooking.carName}
            onChangeText={(text) => setNewBooking({ ...newBooking, carName: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Car Make"
            value={newBooking.carMake}
            onChangeText={(text) => setNewBooking({ ...newBooking, carMake: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            value={newBooking.price}
            onChangeText={(text) => setNewBooking({ ...newBooking, price: text })}
            style={styles.input}
          />
          <Button title="Book Now" onPress={handleBookSparePart} />
          <Button title="Cancel" onPress={handleCancelBookingForm} color="red" />
        </View>
      )}

      <View>
        <Text style={styles.heading}>Spare Parts</Text>
        {spareParts.map((part, index) => (
  <View key={index} style={styles.sparePart}>
    <Text>{part.spareName} - {part.carName}</Text>
    {part.image && <Image source={{ uri: part.image }} style={styles.image} />}
    <TouchableOpacity onPress={() => handleEditSparePart(index)} style={styles.editButton}>
      <Text>Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleDeleteSparePart(index)} style={styles.deleteButton}>
      <Text>Delete</Text>
    </TouchableOpacity>
  </View>
))}

      </View>

      <View>
        <Text style={styles.heading}>Bookings</Text>
        {bookings.map((booking, index) => (
          <View key={index} style={styles.booking}>
            <Text>{booking.customerName} - {booking.spareName}</Text>
            <Button title="Generate Receipt" onPress={() => handleGenerateReceipt(booking)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
  image: {
    width: 300,
    height: 250,
    marginTop: 10,
    borderRadius: 5,
    resizeMode:'contain'
  },
  button: {
    marginVertical: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sparePart: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  booking: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#e9e9e9",
  },
  editButton: {
    marginTop: 10,
    backgroundColor: "#f0ad4e",
    padding: 5,
    borderRadius: 4,
    alignItems: "center",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#d9534f",
    padding: 5,
    borderRadius: 4,
    alignItems: "center",
  },
});
