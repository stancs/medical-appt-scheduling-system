const mongoose = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        index: true,
    },
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    phone: String,
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

const providerSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        index: true,
    },
    firstName: String,
    middleName: String,
    lastName: String,
    degree: String,
    email: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    county: String,
    zipCode: String,
    state: String,
    isAcceptingNewPatient: Boolean,
    languagesSpoken: String,
    npi: String,
    education: {
        medicalSchool: String,
        residency: String,
    },
    biography: String,
    affiliation: {
        medicalGroup: String,
        hospital: String,
    },
});

const appointmentSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'patient',
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'provider',
    },
    startDateTime: Date,
    endDateTime: Date,
    location: String,
    room: String,
});

const Patient = mongoose.model('patient', patientSchema);
const Provider = mongoose.model('provider', providerSchema);
const Appointment = mongoose.model('appointment', appointmentSchema);

module.exports = {
    Patient,
    Provider,
    Appointment,
};
