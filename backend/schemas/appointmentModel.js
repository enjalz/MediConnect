const mongoose = require("mongoose");

const appointmentModel = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    userInfo: {
      type: Object,
      default: {},
      required: true,
    },
    doctorInfo: {
      type: Object,
      default: {},
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    document: {
      type: Object,
    },
    // pending | approved | rejected | cancelled | completed
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    cancelReason: {
      type: String,
      default: "",
    },
    visitSummary: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const appointmentSchema = mongoose.model("appointment", appointmentModel);

module.exports = appointmentSchema;