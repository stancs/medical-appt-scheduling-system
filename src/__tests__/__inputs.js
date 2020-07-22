const patientInput = {
    userName: 'avery1234',
    firstName: 'Avery',
    middleName: 'Eva',
    lastName: 'Lee',
    email: 'avery@yopmail.com',
    phone: '512-112-2222',
    addressLine1: '2000 Blackthorn Dr',
    addressLine2: 'Rm 101',
    city: 'Pflugerville',
    state: 'TX',
    county: 'Travis County',
    zipCode: '78660',
    isSmoker: false,
    birthday: '2018-12-11',
};

const providerInput = {
    userName: 'christian1234',
    firstName: 'Christian',
    middleName: 'Lydia',
    lastName: 'Dovis',
    email: 'christian@yopmail.com',
    phone: '512-112-2222',
    addressLine1: '1235 Blackthorn Dr',
    addressLine2: 'Rm 101',
    city: 'Pflugerville',
    state: 'TX',
    county: 'Travis County',
    zipCode: '78660',
    isAcceptingNewPatient: true,
    languagesSpoken: ['English', 'Spanish'],
    npi: '1234234',
    education: {
        medicalSchool: 'Harvard University',
        residency: 'Yale University',
    },
    biography: 'I studied hard',
    affiliation: {
        medicalGroup: 'Saint Andrew Medical Group',
        hospital: 'Saint Paul Hospital',
    },
    regularShift: {
        Monday: [
            {
                start: '09:00',
                end: '12:00',
            },
            {
                start: '13:00',
                end: '17:00',
            },
        ],
        Tuesday: [
            {
                start: '09:00',
                end: '12:00',
            },
            {
                start: '13:00',
                end: '17:00',
            },
        ],
        Wednesday: [
            {
                start: '09:00',
                end: '12:00',
            },
            {
                start: '13:00',
                end: '17:00',
            },
        ],
    },
    scheduledShifts: [
        {
            startDate: '2020-10-01',
            endDate: '2020-10-30',
            shift: {
                Monday: [
                    {
                        start: '09:00',
                        end: '12:00',
                    },
                    {
                        start: '13:00',
                        end: '18:00',
                    },
                ],
                Tuesday: [
                    {
                        start: '09:00',
                        end: '12:00',
                    },
                    {
                        start: '13:00',
                        end: '18:00',
                    },
                ],
                Wednesday: [
                    {
                        start: '09:00',
                        end: '12:00',
                    },
                    {
                        start: '13:00',
                        end: '18:00',
                    },
                ],
            },
        },
    ],
    blockedShifts: [
        {
            startDate: '2020-10-10',
            endDate: '2020-10-13',
        },
    ],
    timeZone: 'America/Chicago',
};

module.exports = {
    patientInput,
    providerInput,
};
