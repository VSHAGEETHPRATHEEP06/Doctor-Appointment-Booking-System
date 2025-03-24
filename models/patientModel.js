// patientModel.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Updated to match the collection name in MongoDB
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, "First name is required"]
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"]
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  bloodGroup: {
    type: String,
    required: [true, "Blood group is required"],
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  },
  medicalProblem: {
    type: String,
    required: [true, "Medical problem description is required"]
  },
  problemDuration: {
    type: String,
    required: [true, "Problem duration is required"],
    enum: [
      "Less than 1 week",
      "1-4 weeks",
      "1-6 months",
      "More than 6 months"
    ]
  },
  height: {
    type: Number,
    required: [true, "Height is required"],
    min: [100, "Height must be at least 100 cm"],
    max: [250, "Height cannot exceed 250 cm"]
  },
  weight: {
    type: Number,
    required: [true, "Weight is required"],
    min: [30, "Weight must be at least 30 kg"],
    max: [300, "Weight cannot exceed 300 kg"]
  },
  address: {
    street: {
      type: String,
      required: [true, "Street address is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    state: {
      type: String,
      required: [true, "State is required"]
    },
    zip: {
      type: String,
      required: [true, "ZIP code is required"]
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, "Emergency contact name is required"]
    },
    phone: {
      type: String,
      required: [true, "Emergency phone number is required"],
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    relation: {
      type: String,
      required: [true, "Emergency contact relation is required"]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Patient", patientSchema);