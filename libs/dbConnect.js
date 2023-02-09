const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if(!MONGODB_URI) {
  throw new Error('');
}

let cached = global.mongoose;

if(!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

module.exports = async function dbConnect() {
  if(cached.conn) {
    return cached.conn;
  }
  if(!cached.promise) {
    const opt = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opt).then(mongoose => {
        return mongoose;
    });
    cached.conn = await cached.promise;
    return cached.conn;
  }
}