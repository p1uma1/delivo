const merchantRepository = require("../repositories/merchantRepository");

const getAllMerchants = async (req, res) => {
  try {
    const merchants = await merchantRepository.getAllMerchants();
    res.json({ success: true, data: merchants });
  } catch (error) {
    console.error("Error in getAllMerchants:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMerchantById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await merchantRepository.getMerchantById(id);
    
    if (!merchant) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }
    
    res.json({ success: true, data: merchant });
  } catch (error) {
    console.error("Error in getMerchantById:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllMerchants,
  getMerchantById,
};
