const axios = require("axios");
const Transaction = require("../models/transaction");
const codeGenerator = require("./codeGenerator");
require("dotenv").config();

const initiatePaymentService = async (req, res) => {
  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
      },
    };

    const body = {
      amount: Number(req.body.amount) * 100,
      email: req.body.email,
      user_id: req.body._id,
      cinema_id: req.body.metadata.cinema_id,
      branch_id: req.body.metadata.branch_id,
      reference: "BS-TF" + codeGenerator(10),
    };

    const response = await axios.post(process.env.PAYSTACK_URL, body, options);
    const paymentLink = response.data;

    const transaction = new Transaction({ ...body, amount: body.amount / 100 });
    await transaction.save();

    res.status(200).json({
      status: "Transaction initalized",
      data: {
        paymentLink,
        body,
      },
    });
  } catch (err) {
    return res.status(402).json({
      err: err.message,
    });
  }
};

const paystackWebhookService = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      reference: req.data.reference,
    });
    const updateObj = {
      ipAddress: req.data.ip_address,
      currency: req.data.currency,
      channel: req.data.channel,
      transactionId: req.data.id,
      status: req.data.status,
      paidAt: req.data.paid_at,
    };

    const data = transaction._doc;
    transaction.overwrite({ ...data, ...updateObj });
    transaction.save();

    console.log(req.body.data);
    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
    console.log(user);
  } catch (err) {
    return res.status(402).json({
      err: "unable to get payment information",
    });
  }
};

module.exports = {
  initiatePaymentService,
  paystackWebhookService,
};
