const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const url = 'mongodb+srv://stanlee:Password9!@avery.sgwq8.mongodb.net/scheduling?retryWrites=true&w=majority';

mongoose.set('useUnifiedTopology', true);
mongoose.connect(url, { useNewUrlParser: true });
mongoose.connection.once('open', () => console.log(`Connected to mongo at ${url}`));
