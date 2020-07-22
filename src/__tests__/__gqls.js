const gql = require('graphql-tag');

const GET_PATIENTS = gql`
    query {
        getPatients {
            id
            userName
            firstName
            middleName
            lastName
            gender
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isSmoker
            birthday
        }
    }
`;

const GET_PROVIDERS = gql`
    query {
        getProviders {
            id
            userName
            firstName
            middleName
            lastName
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isAcceptingNewPatient
            languagesSpoken
            npi
            education {
                medicalSchool
                residency
            }
            biography
            affiliation {
                medicalGroup
                hospital
            }
            regularShift
            scheduledShifts {
                startDate
                endDate
                shift
            }
            blockedShifts {
                startDate
                endDate
                shift
            }
            timeZone
        }
    }
`;

const GET_APPOINTMENT_BY_ID = gql`
    query {
        getPatients {
            id
            userName
            firstName
            middleName
            lastName
            gender
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isSmoker
            birthday
        }
    }
`;

const GET_APPOINTMENTS_BY_PERIOD = gql`
    query getAppointmentsByPeriod($startDateTime: String, $endDateTime: String) {
        getAppointmentsByPeriod(startDateTime: $startDateTime, endDateTime: $endDateTime) {
            id
            patient {
                id
                firstName
                lastName
            }
            provider {
                id
                firstName
                lastName
            }
            startDateTime
            endDateTime
            location
            room
        }
    }
`;

const ADD_PATIENT = gql`
    mutation addPatient($input: PatientInput) {
        addPatient(input: $input) {
            success
            message
            patient {
                id
                userName
                firstName
                middleName
                lastName
                gender
                email
                phone
                addressLine1
                addressLine2
                city
                state
                county
                zipCode
                isSmoker
                birthday
            }
        }
    }
`;

const ADD_PROVIDER = gql`
    mutation addProvider($input: ProviderInput) {
        addProvider(input: $input) {
            success
            message
            provider {
                id
                userName
                firstName
                middleName
                lastName
                email
                phone
                addressLine1
                addressLine2
                city
                state
                county
                zipCode
                isAcceptingNewPatient
                languagesSpoken
                npi
                education {
                    medicalSchool
                    residency
                }
                biography
                affiliation {
                    medicalGroup
                    hospital
                }
                regularShift
                scheduledShifts {
                    startDate
                    endDate
                    shift
                }
                blockedShifts {
                    startDate
                    endDate
                    shift
                }
                timeZone
            }
        }
    }
`;

const ADD_APPOINTMENT = gql`
    mutation addAppointment($input: AppointmentInput) {
        addAppointment(input: $input) {
            success
            message
            appointment {
                id
                patient
                provider
                startDateTime
                endDateTime
                location
                room
            }
        }
    }
`;

module.exports = {
    GET_PATIENTS,
    GET_PROVIDERS,
    GET_APPOINTMENT_BY_ID,
    GET_APPOINTMENTS_BY_PERIOD,
    ADD_PATIENT,
    ADD_PROVIDER,
    ADD_APPOINTMENT,
};
