const { gql } = require('apollo-server');

const typeDefs = gql`
    scalar Date
    scalar Time
    scalar DateTime
    scalar JSON

    # Patient information
    type Patient {
        id: ID!
        userName: String
        firstName: String!
        middleName: String
        lastName: String!
        gender: String
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

    # Patient response format after query
    type PatientListResponse {
        success: Boolean!
        message: String
        patients: [Patient]
    }

    # Patient response format after mutation
    type PatientResponse {
        success: Boolean!
        message: String
        patient: Patient
    }

    # Provider information
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
        languagesSpoken: JSON
        npi: String
        education: Education
        biography: String
        affiliation: Affiliation
        regularShift: JSON
        # regularShifts
        # {
        #   Monday: [
        #       {
        #         start: String! # HH:MM (24hr)
        #         end: String!   # HH:MM (24hr)
        #       },
        #       {
        #         start: String! # HH:MM (24hr)
        #         end: String!   # HH:MM (24hr)
        #       }
        #   ],
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
        timeZone: String!
    }

    # Provider response after query
    type ProviderListResponse {
        success: Boolean!
        message: String
        providers: [Provider]
    }

    # Provider response after mutation
    type ProviderResponse {
        success: Boolean!
        message: String
        provider: Provider
    }

    # Provider's schedule shifts information
    # This shows adjusted schedule during the period starting from 'startDate' to 'endDate'
    type ScheduledShift {
        startDate: String! # YYYY-MM-DD
        endDate: String! # YYYY-MM-DD
        shift: JSON
        # regularShifts
        # {
        #  Monday: [
        #       {
        #         start: String! # HH:MM (24hr)
        #         end: String!   # HH:MM (24hr)
        #       },
        #       {
        #         start: String! # HH:MM (24hr)
        #         end: String!   # HH:MM (24hr)
        #       }
        #   ],
        #   Tuesday: {
        #     ...
        #   },
        #   ...
        # }
    }

    # Provider's education information
    type Education {
        medicalSchool: String
        residency: String
    }

    # Provider's affiliation information
    type Affiliation {
        medicalGroup: String
        hospital: String
    }

    # Appointment information
    type Appointment {
        id: ID!
        patient: ID!
        provider: ID!
        startDateTime: DateTime! # Should get it from DateObject.toISOString()
        endDateTime: DateTime! # Should get it from DateObject.toISOString()
        location: String
        room: String
    }

    # Appointment response after mutation
    type AppointmentResponse {
        success: Boolean!
        message: String
        appointment: Appointment
    }

    # Appoinment extended information
    # This shows patient's and provider's detailed information rather than showing just IDs
    type AppointmentExtended {
        id: ID!
        patient: Patient
        provider: Provider
        startDateTime: DateTime # Should get it from DateObject.toISOString()
        endDateTime: DateTime # Should get it from DateObject.toISOString()
        location: String
        room: String
    }

    # Appointment extended response
    type AppointmentExtendedResponse {
        success: Boolean!
        message: String
        appointmentExtended: AppointmentExtended
    }

    # Appointments extended response
    type AppointmentsExtendedResponse {
        success: Boolean!
        message: String
        appointmentsExtended: [AppointmentExtended]
    }

    # Delete response after delete mutation operation
    type DeleteResponse {
        success: Boolean!
        message: String
        deletedCount: Int
    }

    # Input parameters for Patient data Creation
    input PatientInput {
        userName: String!
        firstName: String!
        middleName: String
        lastName: String!
        gender: String
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

    # Input parameters for Patient data Update
    # This update parameters do not have '!' since any of them can be omiited (Only props that needs to be updated are included)
    input PatientUpdateInput {
        userName: String
        firstName: String
        middleName: String
        lastName: String
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

    # Input parameters for Provider data Creation
    input ProviderInput {
        userName: String!
        firstName: String!
        middleName: String
        lastName: String!
        email: String
        phone: String
        addressLine1: String
        addressLine2: String
        city: String
        state: String
        county: String
        zipCode: String
        isAcceptingNewPatient: Boolean
        languagesSpoken: [String]
        npi: String
        education: EducationInput
        biography: String
        affiliation: AffiliationInput
        regularShift: JSON
        scheduledShifts: [ScheduledShiftInput]
        blockedShifts: [ScheduledShiftInput]
        timeZone: String!
    }

    # Input parameters for Provider data Update
    # This update parameters do not have '!' since any of them can be omiited (Only props that needs to be updated are included)
    input ProviderUpdateInput {
        userName: String
        firstName: String
        middleName: String
        lastName: String
        email: String
        phone: String
        addressLine1: String
        addressLine2: String
        city: String
        state: String
        county: String
        zipCode: String
        isAcceptingNewPatient: Boolean
        languagesSpoken: [String]
        npi: String
        education: EducationInput
        biography: String
        affiliation: AffiliationInput
        regularShift: JSON
        scheduledShifts: [ScheduledShiftInput]
        blockedShifts: [ScheduledShiftInput]
        timeZone: String
    }

    input EducationInput {
        medicalSchool: String
        residency: String
    }

    input AffiliationInput {
        medicalGroup: String
        hospital: String
    }

    input ScheduledShiftInput {
        startDate: String! # YYYY-MM-DD
        endDate: String! # YYYY-MM-DD
        shift: JSON
    }

    # Input parameters for Appointment data Creation
    input AppointmentInput {
        patient: ID!
        provider: ID!
        startDateTime: DateTime!
        endDateTime: DateTime!
        location: String
        room: String
    }

    # Input parameters for Appointment data Update
    # Those props with '!' are all essential information to update an appointment
    input AppointmentUpdateInput {
        patient: ID!
        provider: ID!
        startDateTime: DateTime!
        endDateTime: DateTime!
        location: String
        room: String
    }

    type Query {
        getPatients: PatientListResponse
        getPatientById(id: ID!): PatientResponse
        getProviders: ProviderListResponse
        getProviderById(id: ID!): ProviderResponse
        getAppointmentById(id: ID!): AppointmentExtendedResponse
        getAppointmentsByPeriod(startDateTime: DateTime, endDateTime: DateTime): AppointmentsExtendedResponse
        getAppointmentsByProvider(
            providerId: ID!
            startDateTime: DateTime
            endDateTime: DateTime
        ): AppointmentsExtendedResponse
        getAppointmentsByPatient(
            patientId: ID!
            startDateTime: DateTime
            endDateTime: DateTime
        ): AppointmentsExtendedResponse
    }

    type Mutation {
        addAppointment(input: AppointmentInput): AppointmentResponse
        addPatient(input: PatientInput): PatientResponse
        addProvider(input: ProviderInput): ProviderResponse

        cancelAppointment(id: ID!): DeleteResponse
        removePatient(id: ID!): DeleteResponse
        removeProvider(id: ID!): DeleteResponse

        # The input for updating appointment is same as the one for creation
        updateAppointment(id: ID!, input: AppointmentInput): AppointmentResponse
        updatePatient(id: ID!, input: PatientUpdateInput): PatientResponse
        updateProvider(id: ID!, input: ProviderUpdateInput): ProviderResponse
    }
`;

module.exports = typeDefs;
