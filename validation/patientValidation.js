// validation/patientValidation.js
const Joi = require("joi");

const createPatientSchema = Joi.object({
  userId: Joi.string().required().label("User ID"),
  firstName: Joi.string().required().label("First Name"),
  lastName: Joi.string().required().label("Last Name"),
  dob: Joi.alternatives().try(
    Joi.date().required(),
    Joi.string().required()
  ).label("Date of Birth"),
  phone: Joi.string().pattern(/^\d{10}$/).required().label("Phone Number"),
  bloodGroup: Joi.string().valid(
    "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
  ).required().label("Blood Group"),
  medicalProblem: Joi.string().required().label("Medical Problem"),
  problemDuration: Joi.string().valid(
    "Less than 1 week",
    "1-4 weeks",
    "1-6 months",
    "More than 6 months"
  ).required().label("Problem Duration"),
  height: Joi.number().min(100).max(250).required().label("Height"),
  weight: Joi.number().min(30).max(300).required().label("Weight"),
  
  // Address can be either an object or individual fields
  address: Joi.object({
    street: Joi.string().required().label("Street Address"),
    city: Joi.string().required().label("City"),
    state: Joi.string().required().label("State"),
    zip: Joi.string().required().label("ZIP Code")
  }).required().label("Address"),
  
  // Street, city, state, and zip can be at the root level too
  street: Joi.string().optional().label("Street Address"),
  city: Joi.string().optional().label("City"),
  state: Joi.string().optional().label("State"),
  zip: Joi.string().optional().label("ZIP Code"),
  
  // Emergency contact can be either an object or individual fields
  emergencyContact: Joi.object({
    name: Joi.string().required().label("Emergency Contact Name"),
    phone: Joi.string().pattern(/^\d{10}$/).required().label("Emergency Phone"),
    relation: Joi.string().required().label("Relationship")
  }).required().label("Emergency Contact")
});

module.exports = {
  createPatientSchema
};