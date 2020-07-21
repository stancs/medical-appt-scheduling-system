const mongoose = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema(
    {
        // Account username
        userName: {
            type: String,
            unique: true,
            index: true,
        },
        firstName: {
            type: String,
            trim: true,
        },
        middleName: String,
        lastName: String,
        gender: {
            type: String,
            enum: ['M', 'F'],
        },
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
        // Birthday: YYYY-MM-DD
        birthday: String,
    },
    { timestamps: true },
);

const providerSchema = new Schema(
    {
        // Account username
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
        languagesSpoken: [String],
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
        regularShift: Object,
        scheduledShifts: [
            {
                startDate: String,
                endDate: String,
                shift: Object,
            },
        ],
        blockedShifts: [
            {
                startDate: String,
                endDate: String,
                shift: Object,
            },
        ],
        timeZone: {
            type: String,
            default: 'America/Chicago',
        },
    },
    { timestamps: true },
);

const appointmentSchema = new Schema(
    {
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
    },
    { timestamps: true },
);

const Patient = mongoose.model('patient', patientSchema);
const Provider = mongoose.model('provider', providerSchema);
const Appointment = mongoose.model('appointment', appointmentSchema);

module.exports = {
    Patient,
    Provider,
    Appointment,
};
