//This file contains the configuration for user, which allows users to be created.
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,            // Use the new MongoDB driver's connection string parser
  useUnifiedTopology: true,         // Opt-in to the new connection management engine
  tls: true,                        // Enable TLS (important for MongoDB Atlas)
  tlsAllowInvalidCertificates: false, // Ensures the certificate is valid (could be true for self-signed certs)
  autoIndex: true,                  // Automatically build indexes
  connectTimeoutMS: 10000,          // Timeout after 10 seconds if unable to connect
  serverSelectionTimeoutMS: 5000,   // Timeout for MongoDB server selection process
  socketTimeoutMS: 45000,           // Closes sockets after 45 seconds of inactivity
  family: 4                         // Use IPv4, skip trying IPv6

})

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: function() {
            return !this.githubId
        },
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: function(){
            return !this.githubId
        }
    },
    githubId: {
        type: String,
        required: false,
        sparse: true,
        unique: true
    }
    })

const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    startdate: {
        type: Date,
        required: true
    },
    duedate: {
        type: Date,
        required: true
    },
    daysAvailable: {
        type: Number,
        required: true
    },
    daysLeft: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})    

const Task = new mongoose.model("tasks", taskSchema);
const User = new mongoose.model("users", userSchema);

module.exports = {
    User,
    Task
};