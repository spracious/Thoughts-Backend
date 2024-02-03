const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    expires_in: {
      type: Date,
    },
    cinema_id: {
      type: String,
      required: true,
      ref: "cinemas",
    },
    created_at: {
      type: Date,
      default: Date.now,
  },
  });

const Verification = mongoose.model("verifications", VerificationSchema);
module.exports = Verification;
