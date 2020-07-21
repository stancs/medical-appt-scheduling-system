const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const url = process.env.MONGO_DB_URL;

mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(url, { useNewUrlParser: true });
mongoose.connection.once('open', () => console.log(`Connected to mongo at ${url}`));
