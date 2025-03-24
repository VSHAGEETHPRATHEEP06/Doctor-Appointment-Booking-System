const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        // Allow empty string or valid phone number
        return v === '' || /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  officeAddress: String,
  emergencyContact: {
    type: String,
    validate: {
      validator: function(v) {
        // Allow empty string or valid phone number
        return v === '' || /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);