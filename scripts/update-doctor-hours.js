// Script to update doctor working hours
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

// Import doctor model
const doctorModel = require('../models/doctorModel');

const updateDoctorHours = async () => {
  try {
    // Update all doctors to have working hours from 9:00 to 17:00
    const result = await doctorModel.updateMany(
      {}, 
      { $set: { timings: ["09:00", "17:00"] } }
    );
    
    console.log(`Updated ${result.modifiedCount} doctors with new working hours`);
    
    // Fetch and display updated doctors
    const doctors = await doctorModel.find({});
    doctors.forEach(doctor => {
      console.log(`Doctor: ${doctor.firstName} ${doctor.lastName}, Working Hours: ${doctor.timings[0]} - ${doctor.timings[1]}`);
    });
    
    console.log('Update completed successfully');
  } catch (error) {
    console.error('Error updating doctor hours:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update function
updateDoctorHours();
