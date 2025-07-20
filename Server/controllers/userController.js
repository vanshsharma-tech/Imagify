import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { verify, sign } = jwt;
import razorpay from "razorpay";
import transactionModel from "../model/transactionModel.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let existUser = await userModel.findOne({ email });
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (existUser) {
      return res
        .status(400)
        .json({ message: "User Already Exist with this mail" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.jwt_secret);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.jwt_secret);
      res.json({ success: true, token, user: { name: user.name } });
    } else {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const userCredits = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentRazorpay = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.userId;

    if (!userId || !planId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let credits, plan, amount, date;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 50;
        amount = 10;
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 250;
        amount = 50;
        break;
      case "Business":
        plan = "Business";
        credits = 500;
        amount = 1000;
        break;

      default:
        return res.json({ success: false, message: "Plan not found" });
    }

    date = Date.now();

    const transactionData = {
      userId,
      plan,
      amount,
      credits,
      date,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id,
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const verifyRozarpay = async (req, res) => {
  try {
    // const {razorpay_order_id,razorpay_payment_id,razorpay_signature}
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const transactionData = await transactionModel.findById(
        orderInfo.receipt
      );
      if (transactionData.payment) {
        return res.json({ success: false, message: "Payment failed" });
      }
      const userData = await userModel.findById(transactionData.userId);
      const creditBalance = userData.creditBalance + transactionData.credits;
      await userModel.findByIdAndUpdate(userData._id, { creditBalance });
      await transactionModel.findOneAndUpdate(transactionData._id, {
        payment: true,
      });
      res.json({ success: true, message: "Credits Added" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
