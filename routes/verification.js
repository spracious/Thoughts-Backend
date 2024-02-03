const express = require("express");
let app = express.Router();
const Cinema = require("../models/cinema");
let Verification = require("../models/verification");
let User = require("../models/user");
let codeGenerator = require("../utils/codeGenerator");
const Email = require("../utils/email");

// Get all verifications
app.get("/", async (req, res) => {
  try {
    let verifications = await Verification.find().populate("cinema_id");
    res.json(verifications);
  } catch (e) {
    console.log(e.message);
  }
});

// Get a verification by ID
app.get("/:id", async (req, res) => {
  try {
    const verificationId = req.params.id;
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      res.status(404).json({ msg: "Verification not found", code: 404 });
    } else {
      res.status(200).json(verification);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Create a new verification
app.post("/", async (req, res) => {
  try {
    let { cinema_id } = req.body;

    let cinema = await Cinema.findById(cinema_id);

    if (!cinema)
      return res.status(404).send({ msg: "Cinema does not exist", code: 404 });

    req.body.code = codeGenerator();
    let verification = new Verification(req.body);
    await verification.save();

    res.send(verification);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

// resend new verification
app.post("/resend", async (req, res) => {
  try {
    let { email, cinema_id } = req.body;

    let checkIfVerificationExists = await Verification.findOne({
      email,
      cinema_id,
      is_active: true,
    });
    if (checkIfVerificationExists) {
      checkIfVerificationExists.is_active = false;
      await checkIfVerificationExists.save();
    }

    const savedUser = await User.findOne({ email, cinema_id });
    if (!savedUser) {
      return res.status(404).send({ msg: "User does not exist", code: 404 });
    }
    req.body.code = codeGenerator();
    let verification = new Verification(req.body);
    await verification.save();

    await new Email(savedUser, req.body.code).sendSignupVerification();

    res.send(verification);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

app.post("/verify", async (req, res) => {
  try {
    let { email, code } = req.body;
    let time;
    let verify = await Verification.findOne({ email, code, is_active: true });

    if (!verify) return res.json({ msg: "Invalid code was supplied." });
    if (!verify.is_active) return res.json({ msg: "Code is already expired" });

    time =
      (Date.now() - new Date(verify.created_at).getTime()) / (1000 * 60 * 15);

    if (time > 15) {
      verify.is_active = false;
      verify.save();
      return res.json({ msg: "Code is already expired" });
    }

    // call the user and set the is_verified = true
    let user = await User.findOne({ email });
    if (user) {
      verify.is_active = false;
      verify.save();

      user.is_verified = true;
      user.save({ validateBeforeSave: false });

      res.json({
        msg: "Verfication successful",
      });
    } else {
      res.status(404).json({
        msg: "user email does not exist",
      });
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

// Update a verification by ID
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await Verification.findById(id);

    if (!verification)
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });

    let data = verification._doc;
    verification.overwrite({ ...data, ...req.body });
    verification.save();

    res.send({ msg: "verification updated", data: verification });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Delete a verification by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await Verification.findById(id);

    if (!verification) {
      res.status(404).json({ message: "verification not found", code: 404 });
    } else {
      await verification.deleteOne();
      res
        .status(200)
        .send({ msg: "verification deleted successfully", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
