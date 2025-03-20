// validation/patientValidation.js
const Joi = require("joi");

const createPatientSchema = Joi.object({
  firstName: Joi.string().required().label("First Name"),
  lastName: Joi.string().required().label("Last Name"),
  dob: Joi.date().required().label("Date of Birth"),
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
  street: Joi.string().required().label("Street Address"),
  city: Joi.string().required().label("City"),
  state: Joi.string().required().label("State"),
  zip: Joi.string().required().label("ZIP Code"),
  emergencyContact: Joi.object({
    name: Joi.string().required().label("Emergency Contact Name"),
    phone: Joi.string().pattern(/^\d{10}$/).required().label("Emergency Phone"),
    relation: Joi.string().required().label("Relationship")
  }).required()
});

module.exports = {
  createPatientSchema
};