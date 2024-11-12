const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    leaderId: {
      type: String,
      // required: [true, "Photo title is required"],
    },
    date: {
      type: Date,
      // required: [true, "Date is required"],
    },

    image: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2020/10/25/09/23/seagull-5683637_960_720.jpg",
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

//compile
const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
