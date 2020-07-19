const { gql } = require('apollo-server');

const typeDefs = gql`
    scalar Date
    scalar Time
    scalar DateTime
    scalar JSONObject

    type Patient {
        id: ID!
        userName: String
        firstName: String!
        middleName: String
        lastName: String!
        email: String
        phone: String
        ssn: String
        addressLine1: String
        addressLine2: String
        city: String
        state: String
        county: String
        zipCode: String
        isSmoker: Boolean
        birthday: String
    }

    type Provider {
        id: ID!
        userName: String
        firstName: String!
        middleName: String
        lastName: String!
        degree: String
        email: String
        phone: String
        addressLine1: String
        addressLine2: String
        city: String
        state: String
        county: String
        zipCode: String
        isAcceptingNewPatient: Boolean
        languageSpoken: [String]
        npi: String
        education: Education
        biography: String
        affiliation: Affiliation
        regularShift: JSONObject
        # regularShifts
        # {
        #   Monday: {
        #     start: String! # HH:MM (24hr)
        #     end: String!   # HH:MM (24hr)
        #   },
        #   Tuesday: {
        #     ...
        #   },
        #   ...
        # }
        scheduledShifts: [ScheduledShift]
        blockedShifts: [ScheduledShift]
        # Time zone
        # Should get it from console.log(Intl.DateTimeFormat().resolvedOptions().timeZone) in browser side
        # https://stackoverflow.com/questions/1091372/getting-the-clients-timezone-offset-in-javascript
        timeZone: String
    }

    type ScheduledShift {
        startDate: String! # YYYY-MM-DD
        endDate: String! # YYYY-MM-DD
        shift: JSONObject
        # regularShifts
        # {
        #   Monday: {
        #     start: String! # HH:MM (24hr)
        #     end: String!   # HH:MM (24hr)
        #   },
        #   Tuesday: {
        #     ...
        #   },
        #   ...
        # }
    }

    type Education {
        medicalSchool: String
        residency: String
    }

    type Affiliation {
        medicalGroup: String
        hospital: String
    }

    type Shift {
        dayOfWeek: DayOfWeek!
        start: Time!
        end: Time!
    }

    enum DayOfWeek {
        MONDAY
        TUESDAY
        WEDNESDAY
        THURSDAY
        FRIDAY
        SATURDAY
        SUNDAY
    }

    type Appointment {
        id: ID!
        patient: Patient
        provider: Provider
        startDateTime: DateTime
        endDateTime: DateTime
        location: String
        room: String
    }

    type DeleteResult {
        isSuccess: Boolean
        deletedCount: Int
    }

    type Query {
        getPatients: [Patient]
        getPatientById(id: ID!): Patient
        getProviders: [Provider]
        getProviderById(id: ID!): Provider
        getAppointmentById(id: ID!): Appointment
        getAppointmentsByPeriod(startDateTime: DateTime, endDateTime: DateTime): [Appointment]
        getAppointmentsByProvider(providerId: ID!, startDateTime: DateTime, endDateTime: DateTime): [Appointment]
        getAppointmentsByPatient(patientId: ID!, startDateTime: DateTime, endDateTime: DateTime): [Appointment]
    }

    type Mutation {
        addPatient(userName: String!, firstName: String!, lastName: String!, email: String, phone: String): Patient
        addProvider(userName: String!, firstName: String!, lastName: String!, email: String, phone: String): Provider
        addAppointment(
            patientId: String!
            providerId: String!
            startDateTime: DateTime
            endDateTime: DateTime
            location: String
            room: String
        ): Appointment
        updateAppointment(id: ID!): Appointment
        cancelAppointment(id: ID!): DeleteResult
        removePatient(id: ID!): DeleteResult
        removeProvider(id: ID!): DeleteResult
        updatePatient(id: ID!, firstName: String, lastName: String, email: String, phone: String): Patient
        updateProvider(id: ID!, firstName: String, lastName: String, email: String, phone: String): Provider
    }
`;

module.exports = typeDefs;
