const { Schema, model } = require('mongoose')

const blogSchema = new Schema({
    title:{
        type:String,
        require: true
    },
    body:{
        type:String,
        require: true
    },
    coverImageURL:{
        type:[String],
        require: false
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    category: {
        type: String,
        enum: ['Plumber', 'Electrician', 'Mechanic', 'Painter', 'Carpenter', 'AC Technician', 'Welder', 'Driver', 'Gardener', 'Security Guard', 'Mason', 'Roofer', 'Glass Installer', 'Floor Tiler', 'Pest Control Specialist', 'Locksmith', 'Interior Designer', 'Cleaning Expert', 'Laundry/Washing Services', 'Waterproofing Expert', 'Solar Panel Installer', 'Network Technician', 'CCTV Installer', 'IT Support Technician', 'Landscaper'],
        required: true
      },
      

}, { timestamps: true})



const Blog = model("blog", blogSchema)
module.exports = Blog