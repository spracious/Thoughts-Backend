const express = require('express');
const Transaction = require('../models/transaction');
const Bookings = require('../models/booking');
const pug = require('pug');
// const { Protect } = require("../middleware/auth");
const axios = require('axios');
const { initiatePaymentService } = require('../utils/payment');
const codeGenerator = require('../utils/codeGenerator');
let app = express.Router();
require('dotenv').config();

app.post('/initiate-payment', initiatePaymentService);

app.post('/counter', async (req, res) => {
	const body = {
		amount: Number(req.body.amount),
		paidAt: new Date().toISOString(),
		email: req.body.email,
		cinema_id: req.body.cinema_id,
		branch_id: req.body.branch_id,
		reference: 'BS-TF' + codeGenerator(10),
		channel: req.body.channel.toLowerCase(),
		status: 'success',
	};

	const transaction = new Transaction(body);
	await transaction.save();

	res.status(200).json({
		status: 'Transaction successful',
	});
});

app.get('/getstatus', async (req, res) => {
	try {
		let { reference } = req.query;

		const transaction = await Transaction.findOne({
			reference,
		});
		// const booking = await Bookings.findOne({
		//   reference,
		// });

		let url = process.env.PAYSTACK_GETSTATUS_URL + `${reference}`;
		let redirectURL =
			process.env.MODE === 'PROD'
				? 'https://boxstreetcinema.onrender.com/history'
				: 'http://localhost:3000/history';

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
			},
		});

		const payload = response.data;

		const updateObj = {
			ipAddress: payload.data.ip_address,
			currency: payload.data.currency,
			channel: payload.data.channel,
			transactionId: payload.data.id,
			status: payload.data.status,
			paidAt: payload.data.paid_at,
			message: payload.data.message,
		};

		const data = transaction._doc;
		transaction.overwrite({ ...data, ...updateObj });
		transaction.save();

		res.status(200).render('reciept', {
			email: transaction.email,
			amount: transaction.amount,
			status: updateObj.status,
			date: updateObj.paidAt,
			transactionId: updateObj.transactionId,
			route: redirectURL,
		});
	} catch (err) {
		return res.status(402).json({
			err: 'unable to get payment information',
		});
	}
});

app.get('/', async (req, res) => {
	try {
		const transactions = await Transaction.find().populate('user_id');
		res.status(200).json({
			status: 'success',
			data: {
				transactions,
			},
		});
	} catch (err) {
		res.status(500).json({ err: err.message });
	}
});

app.get('/summary', async (req, res) => {
	try {
		const summary = await Transaction.aggregate([
			{
				$lookup: {
					from: 'cinemas',
					localField: 'cinema_id',
					foreignField: '_id',
					as: 'cinema',
				},
			},
			{ $unwind: '$cinema' },
			{
				$lookup: {
					from: 'branches',
					localField: 'branch_id',
					foreignField: '_id',
					as: 'branch',
				},
			},
			{ $unwind: '$branch' },
			{
				$group: {
					_id: {
						year: { $year: '$paidAt' },
						month: { $month: '$paidAt' },
						day: { $dayOfMonth: '$paidAt' },
						cinema_id: '$cinema',
						branch_id: '$branch',
					},
					amount: { $sum: '$amount' },
					avgAmount: { $avg: '$amount' },
				},
			},
		]);

		res.status(200).json({
			status: 'success',
			summary,
		});
	} catch (err) {
		res.status(500).json({ err: err.message });
	}
});

app.get('/summary-details', async (req, res) => {
	try {
		const summary = await Transaction.aggregate;

		res.status(200).json({
			status: 'success',
			summary,
		});
	} catch (err) {}
});

app.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const payment = await Transaction.findById(id);

		if (!payment)
			return res
				.status(404)
				.json({ msg: 'The id supplied does not exist', code: 404 });

		let data = payment._doc;
		payment.overwrite({ ...data, ...req.body });
		payment.save();

		res.status(500).json({
			msg: 'Payment updated!',
			data: {
				payment,
			},
		});
	} catch (err) {
		res.status(500).json({ err: err.message });
	}
});

module.exports = app;
