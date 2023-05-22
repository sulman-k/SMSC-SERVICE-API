const { query } = require("../config/sqlDatabase");
const moduleName = "[strings-based-charging]",
  logger = require(`${__utils}/logger/logger`)(moduleName);

exports.getStringsBasedCharging = async (req, res) => {
  try {
    logger.info("[getStringsBasedCharging][controller]");
    let result = await query(
      `SELECT * FROM regex_patterns;` //WHERE created_by='${req.headers.enduser}'
    );

    if (result.code) {
      logger.error("[getStringsBasedCharging][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getStringsBasedCharging][response]", {
      success: true,
      data: result,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error("[getStringsBasedCharging][error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStringsBasedCharging = async (req, res) => {
  try {
    logger.info("[addStringsBasedCharging][body]", req.body);
    const { msisdn_pattern, short_code, chargeable,amount_charged } = req.body;
    if (!msisdn_pattern && !short_code && !chargeable && !amount_charged) {
      logger.error("[addStringsBasedCharging][error]", {
        success: false,
        message: "Invalid data.",
      });

      return res.status(203).json({ success: false, message: "Invalid data." });
    }
    let result = await query(
      `INSERT INTO regex_patterns (msisdn_pattern, short_code, chargeable,amount_charged, created_by) VALUES 
      ('${msisdn_pattern}', '${short_code}', ${chargeable},${amount_charged} '${req.headers.enduser}');`
    );

    if (result.code) {
      logger.error("[addStringsBasedCharging][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[addStringsBasedCharging][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Service code added successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[addStringsBasedCharging][error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editStringsBasedCharging = async (req, res) => {
  try {
    logger.info("[editStringsBasedCharging][body]", req.body);
    const { msisdn_pattern, short_code, chargeable,amount_charged } = req.body;
    if (!msisdn_pattern && !short_code && !chargeable && !amount_charged) {
      logger.error("[editStringsBasedCharging][error]", {
        success: false,
        message: "Invalid data.",
      });

      return res.status(203).json({ success: false, message: "Invalid data." });
    }
    let result = await query(
      `UPDATE regex_patterns SET msisdn_pattern='${msisdn_pattern}', chargeable=${chargeable}, amount_charged=${amount_charged}  
      WHERE short_code = '${short_code}';`
    );

    if (result.code) {
      logger.error("[editStringsBasedCharging][error]", result);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[editStringsBasedCharging][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Service code updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[editStringsBasedCharging][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStringsBasedCharging = async (req, res) => {
  try {
    logger.info("[deleteStringsBasedCharging][params]", req.params);

    let result = await query(
      `DELETE FROM regex_patterns WHERE id =${req.params.id};`
    );

    if (result.code) {
      logger.error("[deleteStringsBasedCharging][error]", result);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[deleteStringsBasedCharging][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Deleted successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[deleteStringsBasedCharging][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

//Exclusive List

exports.getExclusiveList = async (req, res) => {
  try {
    logger.info("[getExclusiveList][controller]");
    let result = await query(
      `SELECT * FROM exclusive_list;` //WHERE created_by='${req.headers.enduser}'
    );

    if (result.code) {
      logger.error("[getExclusiveList][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getExclusiveList][response]", {
      success: true,
      data: result,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error("[getExclusiveList][error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addExclusiveList = async (req, res) => {
  try {
    logger.info("[addExclusiveList][body]", req.body);
    const { msisdn_pattern, short_code, chargeable } = req.body;
    if (!msisdn_pattern && !short_code && !chargeable) {
      logger.error("[addExclusiveList][error]", {
        success: false,
        message: "Invalid data.",
      });

      return res.status(203).json({ success: false, message: "Invalid data." });
    }
    let result = await query(
      `INSERT INTO exclusive_list (msisdn_pattern, short_code, chargeable, created_by) VALUES 
      ('${msisdn_pattern}', '${short_code}', ${chargeable}, '${req.headers.enduser}');`
    );

    if (result.code) {
      logger.error("[addExclusiveList][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[addExclusiveList][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Exclusive List added successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[addExclusiveList][error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editExclusiveList = async (req, res) => {
  try {
    logger.info("[editExclusiveList][body]", req.body);
    const { msisdn_pattern, short_code, chargeable } = req.body;
    if (!msisdn_pattern && !short_code && !chargeable) {
      logger.error("[editExclusiveList][error]", {
        success: false,
        message: "Invalid data.",
      });

      return res.status(203).json({ success: false, message: "Invalid data." });
    }
    let result = await query(
      `UPDATE exclusive_list SET msisdn_pattern='${msisdn_pattern}', chargeable=${chargeable}  WHERE short_code = '${short_code}';`
    );

    if (result.code) {
      logger.error("[editExclusiveList][error]", result);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[editExclusiveList][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Exclusive list updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[editExclusiveList][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExclusiveList = async (req, res) => {
  try {
    logger.info("[deleteExclusiveList][params]", req.params);

    let result = await query(
      `DELETE FROM exclusive_list WHERE id =${req.params.id};`
    );

    if (result.code) {
      logger.error("[deleteExclusiveList][error]", result);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[deleteExclusiveList][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Deleted successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[deleteExclusiveList][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};
