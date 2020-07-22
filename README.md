# Medical Appointment Scheduling System

This scheduling system connects patients and medical service providers by creating an appointment during their available hours. Using Mongo database, office administrators can enter patient information, provider information, and appointment information and manage these data by updating and deleting.

This backend system uses GraphQL as a communication method between the server and client browsers. 

## Installation

This program uses 3rd party npm packages as below:

- apollo-server
- graphql
- graphql-iso-date
- graphql-type-json
- moment
- moment-timezone
- mongoose
- dotenv
- jest
- faker
...

To install these npm packages, Node.js should be installed beforehand. 

In Node.js environment, run this command

```
npm install
```

## Environment Variables

In local test environment, the environment variables are stored in `.env` file. To read this environment variables, `dotenv` npm package has been used [dotenv npm](https://www.npmjs.com/package/dotenv)

Here is the list of the currently used environment variables:

| Env Variable   | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| MONGO_DB_URL   | Mongo DB URL (Current Mongo DB instance is from Mongo Atlas DB)       |

The preferred approach to run this Node.js app is to preload the environment variables before running actual app. `npm run start` actually preload the environment variables and run the application.

The reasons why I prefer preloading are:

- Less side effects when you preload the environment variables rather than loading them inside the application
- Simliar to the preloading situation inside a cloud infrastructure

## Run

## Test

### GraphQL Query

https://medium.com/@MisterKevin_js/setting-up-visual-studio-code-for-client-side-graphql-autocompletion-using-the-graphql-extension-78d1b34adb44

## Issues

### Time zone

## Future work

- Patient & Providers pagination: If the number of patients and providers are quite big, then we need to use pagination to fetch those lists with limited sizes repeatedly
- Adding Patients and Providers into AWS Cognito account: userName will the key to search user data
  
## References

[Using the Elastic Beanstalk Node.js platform](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.container.html)

[Develop & Deploy a Node.js App to AWS Elastic Beanstalk & MongoDB Atlas](https://www.mongodb.com/blog/post/develop-and-deploy-a-nodejs-app-to-aws-elastic-beanstalk-and-mongodb-atlas)

[Using Mongo DB Atlas with AWS ElasticBeanstalk](https://medium.com/@faridhajnal14/using-mongo-db-atlas-with-aws-elasticbeanstalk-5e97d2340453)

[AWS Elastic Beanstalk: Create an application source bundle](https://www.mongodb.com/blog/post/develop-and-deploy-a-nodejs-app-to-aws-elastic-beanstalk-and-mongodb-atlas)

[Epoch Converter](https://www.epochconverter.com/)

[UTC Time](https://www.utctime.net/)