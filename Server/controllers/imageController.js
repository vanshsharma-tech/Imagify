import userModel from "../model/userModel.js";
import FormData from "form-data";
import axios from "axios";

const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const user = await userModel.findById(req.userId);

    if (!user || !prompt) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
        creditBalance: user?.creditBalance ?? 0,
      });
    }

    if (user.creditBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits",
        creditBalance: user.creditBalance,
      });
    }

    // Prepare prompt
    const formData = new FormData();
    formData.append("prompt", prompt);

    let resultImage;

    try {
      const { data } = await axios.post(
        "https://clipdrop-api.co/text-to-image/v1",
        formData,
        {
          headers: {
            "x-api-key": process.env.CLIPDROP_API,
            ...formData.getHeaders(),
          },
          responseType: "arraybuffer",
        }
      );

      const base64Image = Buffer.from(data, "binary").toString("base64");
      resultImage = `data:image/png;base64,${base64Image}`;
    } catch (clipdropError) {
      console.error("ClipDrop API error:", clipdropError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to generate image. Try again later.",
        creditBalance: user.creditBalance, // return balance even on error
      });
    }

    // Deduct credit **after successful generation**
    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { creditBalance: user.creditBalance - 1 },
      { new: true }
    );

    res.json({
      success: true,
      message: "Image Generated",
      creditBalance: updatedUser.creditBalance,
      resultImage,
    });
  } catch (error) {
    console.error("generateImage Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      creditBalance: 0,
    });
  }
};

export default generateImage;
