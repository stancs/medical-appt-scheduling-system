// const { createTestClient } = require('apollo-server-testing');
// const faker = require('faker');
// const gql = require('graphql-tag');
// const util = require('util');

// // import our production apollo-server instance
// const { server } = require('../');

// const { query, mutate } = createTestClient(server);

// const { startTestServer, toPromise } = require('./__utils');

// const LAUNCH_LIST_QUERY = gql`
//     query myLaunches($pageSize: Int, $after: String) {
//         launches(pageSize: $pageSize, after: $after) {
//             cursor
//             launches {
//                 mission {
//                     name
//                     missionPatch
//                 }
//             }
//         }
//     }
// `;

// const GET_LAUNCH = gql`
//     query launch($id: ID!) {
//         launch(id: $id) {
//             id
//             isBooked
//             rocket {
//                 type
//             }
//             mission {
//                 name
//             }
//         }
//     }
// `;

// const GET_PROVIDERS = gql`
//     query {
//         getProviders {
//             id
//             userName
//             firstName
//             lastName
//             email
//         }
//     }
// `;

// const ADD_PATIENT = gql`
//     mutation addPatient($userName: String!, $firstName: String!, $lastName: String!, $email: String, $phone: String) {
//         addPatient(userName: $userName, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone) {
//             id
//             userName
//             firstName
//             lastName
//             email
//             phone
//         }
//     }
// `;

// const ADD_PROVIDER = gql`
//     mutation addProvider(
//         $userName: String!
//         $firstName: String!
//         $lastName: String!
//         $email: String
//         $phone: String
//         $addressLine1: String
//         $addressLine2: String
//         $city: String
//         $state: String
//         $county: String
//         $zipCode: String
//         $isAcceptingNewPatient: Boolean
//         $languageSpoken: [String]
//         $npi: String
//         $education: JSONObject
//         $biography: String
//         $affiliation: JSONObject
//         $regularShift: JSONObject
//         $scheduledShifts: [JSONObject]
//         $blockedShifts: [JSONObject]
//         $timeZone: String
//     ) {
//         addProvider(
//             userName: $userName
//             firstName: $firstName
//             lastName: $lastName
//             email: $email
//             phone: $phone
//             addressLine1: $addressLine1
//             addressLine2: $addressLine2
//             city: $city
//             state: $state
//             county: $county
//             zipCode: $zipCode
//             isAcceptingNewPatient: $isAcceptingNewPatient
//             languageSpoken: $languagesSpoken
//             npi: $npi
//             education: $education
//             biography: $biography
//             affiliation: $affiliation
//             regularShift: $regularShift
//             scheduledShifts: $scheduledShifts
//             blockedShifts: $blockedShifts
//             timeZone: $timeZone
//         ) {
//             id
//             userName
//             firstName
//             lastName
//             email
//             phone
//         }
//     }
// `;

// describe('Server - e2e', () => {
//     let stop, graphql;

//     beforeEach(async () => {
//         const testServer = await startTestServer(server);
//         stop = testServer.stop;
//         graphql = testServer.graphql;
//     });

//     afterEach(() => stop());

//     it.skip('gets list of launches', async () => {
//         const res = await query({
//             query: GET_PATIENT,
//             variables: {},
//         });

//         expect(res).toMatchSnapshot();
//     });
// });
