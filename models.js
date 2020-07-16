const mongoose = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema({
    userName: String,
    firstName: String,
    middleName: String,
    lastName: String,
    phone: String,
    email: String,
    ssn: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    county: String,
    zipCode: String,
    state: String,
    isSmoker: Boolean,
    birthday: String,
});

const Patient = mongoose.model('patient', patientSchema);

module.exports = {
    Patient,
};
