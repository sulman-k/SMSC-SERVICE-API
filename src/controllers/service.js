const { object } = require("underscore");
const { query } = require("../config/sqlDatabase");
const moduleName = "[service]",
  logger = require(`${__utils}/logger/logger`)(moduleName);

const { updateActiveStatus } = require("../utils/helpers");

const { getSmppConf, getHttpConf } = require("../utils/helpers");

exports.getHttpSmppConf = async (req, res, next) => {
  try {
    logger.info("[getHttpSmppConf][controller]");

    let result;
    if (req.params.type == 1) {
      result = await getSmppConf();
    } else {
      result = await getHttpConf();
    }

    if (result.code) {
      logger.error("[getHttpSmppConf][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getHttpSmppConf][response]", {
      success: true,
      data: result,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error("[getHttpSmppConf][error]", error);

    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getWhiteListGroups = async (req, res, next) => {
  try {
    logger.info("[getWhiteListGroups][controller]");

    let result;
    result = await query(`SELECT * FROM white_listed_msisdn_group 
    WHERE EXISTS (SELECT group_id FROM white_listed_msisdn WHERE group_id=white_listed_msisdn_group.id);`);
    if (result.code) {
      logger.error("[getWhiteListGroups][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getWhiteListGroups][getWhiteListGroups]", {
      success: true,
      data: result,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error("[getWhiteListGroups][getWhiteListGroups]", error);

    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getServiceCodeGroups = async (req, res, next) => {
  try {
    logger.info("[getServiceCodeGroups][controller]");

    let result;
    result = await query(`SELECT distinct group_name FROM service_codes`);
    if (result.code) {
      logger.error("[getServiceCodeGroups][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getServiceCodeGroups][getServiceCodeGroups]", {
      success: true,
      data: result,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error("[getServiceCodeGroups][getServiceCodeGroups]", error);

    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getCampaignEsmeNames = async (req, res, next) => {
  try {
    logger.info("[getCampaignEsmeNames][controller]");

    let result;
    result = await query(`select ed.esme_name,concat(ed.esme_name," - ", m.menu_item_text, case when (m.package_code_text = 'null' or m.package_code_text = '') then "" else concat(" (", m.package_code_text, ")") end) DTMF,
    m.short_code_dtmf
    from menu m
    join esme_detail ed on m.action_id=ed.esme_id
    where m.status=100 and m.menu_item_text is not null and m.esme_protocol=1
    union
    select esd.esme_name,concat(esd.esme_name," - ", m.menu_item_text, case when (m.package_code_text = 'null' or m.package_code_text = '') then "" else concat(" (", m.package_code_text, ")") end) DTMF,
    m.short_code_dtmf
    from menu m
    join esme_soap_details esd on m.action_id=esd.id
    where m.status=100 and m.menu_item_text is not null and m.esme_protocol=2
union
select ed.esme_name,concat(ed.esme_name,"-", m.code_title) DTMF,
    m.short_code as short_code_dtmf
    from service_codes m
    join esme_detail ed on m.action_id=ed.esme_id
    where  m.esme_protocol=1 
    union
    select esd.esme_name,concat(esd.esme_name,"-", m.code_title) DTMF,
    m.short_code as short_code_dtmf
    from service_codes m
    join esme_soap_details esd on m.action_id=esd.id
    where  m.esme_protocol=2;`);
    if (result.code) {
      logger.error("[getCampaignEsmeNames][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getCampaignEsmeNames][getCampaignEsmeNames]", {
      success: true,
      data: result,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error("[getCampaignEsmeNames][getCampaignEsmeNames]", error);

    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getServiceCodes = async (req, res, next) => {
  try {
    logger.info("[getServiceCodes][controller]");
    // let result = await query(
    //   `SELECT * FROM service_codes WHERE created_by='${req.headers.enduser}'`
    // );

    let result = await query(
      `select apesd.esme_name,sc.* from esme_soap_details apesd join service_codes sc on apesd.id=sc.action_id and sc.esme_protocol = 2 
      union
      select aped.esme_name,sc.*  from esme_detail aped join service_codes sc on aped.esme_id=sc.action_id and sc.esme_protocol = 1 
      union 
      select '---' as esme_name,sc.*  from service_codes sc where sc.esme_protocol = 0 
      union 
      select '---' as esme_name,sc.*  from service_codes sc where sc.esme_protocol = 3 `
    );

    let result2 = await query(`SELECT * FROM bank_info WHERE bank_id>=0`);


    if (result.code || result2.code) {
      logger.error("[getServiceCodes][error]", result.code || result2.code);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    for (let obj of result) {
      for (let obj2 of result2) {
        if (obj.short_code == obj2.short_code) {
          Object.assign(obj, {
            bank_id: obj2.bank_id,
            bank_api_url: obj2.bank_api_url,
            authentication_api_url: obj2.authentication_api_url,
            bank_user_name: obj2.bank_user_name,
            bank_password: obj2.bank_password,
          });
        }
      }
    }

    for (let a of result) {
      let result3 = await query(`SELECT 
        id,charge_type,amount,service_id,menu_id,is_whitelist as ch_in_is_whitelist,
        is_sponsored_charging,esme_charging_msisdn,total_slices,slice_intervals 
        FROM charge_info WHERE service_id=${a.id}`
      );
      Object.assign(a, result3[0]);
    }

    console.log("Result Retrieved 2 ::: ", result);
    const sortedResult = result.sort(
      (objA, objB) => Number(objB.created_dt) - Number(objA.created_dt),
    );

    logger.info("[getServiceCodes][response]", {
      success: true,
      data: sortedResult,
    });
    res.json({ success: true, data: sortedResult });
  } catch (error) {
    logger.error("[getServiceCodes][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addServiceCode = async (req, res, next) => {
  try {
    logger.info("[addServiceCode][body]", req.body);
    const {
      short_code,
      title,
      description,
      has_menu,
      action_id,
      is_chargable,
      parent_id,
      charge_type,
      amount,
      session_timeout,
      previous_option,
      fixed,
      relative,
      is_bank_short_code,
      consent_menu,
      consent_lifetime,
      bank_id,
      bank_api_url,
      authentication_api_url,
      bank_user_name,
      bank_password,
      esme_protocol,
      is_sponsored_charging,
      esme_charging_msisdn,
      sms_text,
      optional_sms,
      is_sensitive,
      sms_number,
      sms_number_text,
      group_type,
      total_slices,
      is_string_based_charging,
      authentication_method,
      is_sms_mo,
      slice_intervals,
    } = req.body;
    if (
      !short_code &&
      !title &&
      !description &&
      !has_menu &&
      !action_id &&
      !is_chargable &&
      !parent_id &&
      !charge_type &&
      !amount &&
      !session_timeout &&
      !previous_option &&
      !fixed &&
      !relative &&
      !is_bank_short_code &&
      !consent_menu &&
      !consent_lifetime &&
      !bank_id &&
      !bank_api_url &&
      !authentication_api_url &&
      !bank_user_name &&
      !bank_password &&
      !esme_protocol &&
      !is_sponsored_charging &&
      !esme_charging_msisdn &&
      !sms_text &&
      !optional_sms &&
      !is_sensitive &&
      !sms_number &&
      !sms_number_text &&      
      !group_type &&
      !total_slices &&
      !is_string_based_charging &&
      !authentication_method &&
      !is_sms_mo &&
      slice_intervals
    ) {
      logger.error("[addServiceCode][error]", {
        success: false,
        message: "Invalid data.",
      });

      return res.status(203).json({ success: false, message: "Invalid data." });
    }
    let result = await query(
      `INSERT INTO service_codes (short_code, code_title, code_description, has_menu, action_id, is_chargable, parent_id , 
        session_timeout, is_whitelist, is_normal, previous_option, fixed, relative, is_bank_short_code, consent_menu, consent_lifetime,
        bank_id, esme_protocol, sms_text, optional_sms, is_sensitive,sms_number,sms_number_text,is_string_based_charging,
        authentication_method,is_sms_mo,group_type, created_by) VALUES 
      ('${short_code}', '${title}','${description}', ${has_menu}, ${action_id}, ${is_chargable}, ${parent_id}, ${session_timeout}, 
      false, false , '${previous_option}', ${fixed}, ${relative} , ${is_bank_short_code}, '${consent_menu}', ${consent_lifetime},
      ${bank_id}, ${esme_protocol}, '${sms_text}', ${optional_sms}, ${is_sensitive}, '${sms_number}','${sms_number_text}',
      ${is_string_based_charging},'${authentication_method}',${is_sms_mo},'${group_type}','${req.headers.enduser}');`
    );

    console.log("ressadsad", result);
    if (esme_protocol == 1) {
      await updateActiveStatus(action_id, 0);
    }
    if (esme_protocol == 2) {
      await updateActiveStatus(0, action_id);
    }

    if (is_bank_short_code) {
      await query(
        `INSERT INTO bank_info (bank_id, short_code, bank_api_url, authentication_api_url, bank_user_name, bank_password) VALUES 
        (${bank_id}, '${short_code}', '${bank_api_url}', '${authentication_api_url}', '${bank_user_name}', '${bank_password}');`
      );
    }

    if (result.code) {
      logger.error("[addServiceCode][error]", result.code);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    if (is_chargable) {
      await query(
        `INSERT INTO charge_info (charge_type, amount, service_id, is_sponsored_charging, esme_charging_msisdn, total_slices, slice_intervals) VALUES 
        (${charge_type}, ${amount}, ${
          result.insertId
        }, ${is_sponsored_charging}, '${esme_charging_msisdn}', ${total_slices}, '${JSON.stringify(
          slice_intervals
        )}');`
      );
    }

    logger.info("[addServiceCode][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Service code added successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[addServiceCode][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateServiceCode = async (req, res, next) => {
  try {
    logger.info("[updateServiceCode][body]", req.body);

    const {
      short_code,
      title,
      description,
      charge_type,
      amount,
      is_chargable,
      session_timeout,
      has_menu,
      action_id,
      previous_option,
      fixed,
      relative,
      is_bank_short_code,
      consent_menu,
      consent_lifetime,
      bank_id,
      bank_api_url,
      authentication_api_url,
      bank_user_name,
      bank_password,
      esme_protocol,
      is_sponsored_charging,
      esme_charging_msisdn,
      sms_text,
      optional_sms,
      is_sensitive,
      sms_number,
      sms_number_text,
      group_type,
      total_slices,
      is_string_based_charging,
      authentication_method,
      is_sms_mo,
      slice_intervals,
    } = req.body;
    if (
      !short_code &&
      !title &&
      !description &&
      !charge_type &&
      !amount &&
      !is_chargable &&
      !session_timeout &&
      !has_menu &&
      !action_id &&
      !previous_option &&
      !fixed &&
      !relative &&
      !is_bank_short_code &&
      !consent_menu &&
      !consent_lifetime &&
      !bank_id &&
      !bank_api_url &&
      !authentication_api_url &&
      !bank_user_name &&
      !bank_password &&
      !esme_protocol &&
      !is_sponsored_charging &&
      !esme_charging_msisdn &&
      !sms_text &&
      !optional_sms &&
      !is_sensitive &&
      !sms_number &&
      !sms_number_text &&
      !group_type &&
      !total_slices &&
      !is_string_based_charging &&
      !authentication_method &&
      !is_sms_mo &&
      !slice_intervals
    ) {
      logger.error("[updateServiceCode][error]", {
        success: false,
        message: "Invalid data.",
      });
      return res.status(203).json({ success: false, message: "Invalid data." });
    }
    let result = await query(
      `UPDATE service_codes SET code_title='${title}', code_description='${description}', session_timeout=${session_timeout}, 
      has_menu=${has_menu}, action_id=${action_id}, previous_option='${previous_option}', fixed=${fixed} ,is_bank_short_code=${is_bank_short_code}, 
      consent_menu='${consent_menu}', consent_lifetime=${consent_lifetime}, 
      bank_id=${bank_id},is_chargable=${is_chargable}, esme_protocol=${esme_protocol} ,
      relative=${relative}, sms_text='${sms_text}', optional_sms=${optional_sms}, 
      is_sensitive=${is_sensitive},sms_number='${sms_number}',sms_number_text='${sms_number_text}',
      is_string_based_charging=${is_string_based_charging},
      authentication_method='${authentication_method}',
      is_sms_mo=${is_sms_mo},
      group_type='${group_type}' WHERE id = ${req.params.id};`
    );
 
    if (is_bank_short_code) {
      let result3 = await query(
        `select * from bank_info where short_code='${short_code}'`
      );

      if (result3.length == 0) {
        await query(
          `INSERT INTO bank_info (bank_id, short_code, bank_api_url, authentication_api_url, bank_user_name, bank_password) VALUES 
          (${bank_id}, '${short_code}', '${bank_api_url}', '${authentication_api_url}', '${bank_user_name}', '${bank_password}');`
        );
      } else {
        console.log("UPDATE bank_info");
        updateBankInfo = await query(
          `UPDATE bank_info SET bank_id=${bank_id}, short_code='${short_code}', bank_api_url='${bank_api_url}', authentication_api_url='${authentication_api_url}', 
          bank_user_name='${bank_user_name}', bank_password='${bank_password}' WHERE short_code='${short_code}';`
        );
      }
    } else {
      deleteBank = await query(
        `Delete from bank_info WHERE short_code='${short_code}'`
      );
    }

    let updateChargeInfo;

    if (is_chargable) {
      let checkChargeable = await query(
        `select * from charge_info where service_id = ${req.params.id};`
      );
      if (checkChargeable.length == 0) {
        await query(
          `INSERT INTO charge_info (charge_type, amount, service_id, is_sponsored_charging, esme_charging_msisdn, total_slices, slice_intervals) VALUES 
          (${charge_type}, ${amount}, ${
            req.params.id
          }, ${is_sponsored_charging}, '${esme_charging_msisdn}', ${total_slices}, '${JSON.stringify(
            slice_intervals
          )}');`
        );
      } else {
        updateChargeInfo = await query(
          `UPDATE charge_info SET charge_type=${charge_type}, amount=${amount}, is_sponsored_charging=${is_sponsored_charging}, esme_charging_msisdn='${esme_charging_msisdn}', total_slices=${total_slices}, slice_intervals='${JSON.stringify(
            slice_intervals
          )}' WHERE service_id = ${req.params.id};`
        );
      }
    }

    if (!is_chargable) {
      updateChargeInfo = await query(
        `Delete from charge_info WHERE service_id = ${req.params.id} and menu_id=0;`
      );
      campaignChargeStatus = await query(
        `UPDATE service_codes SET is_chargable=${is_chargable} WHERE id = ${req.params.id};`
      );
    }

    if (result.code) {
      logger.error("[updateServiceCode][error]", result.code);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }
    logger.info("[updateServiceCode][response]", {
      success: true,
      data: result,
    });

    res.json({
      success: true,
      message: "Service code updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[updateServiceCode][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteServiceCode = async (req, res, next) => {
  try {
    logger.info("[deleteServiceCode][query]", req.query);
    const { id,short_code } = req.body;

    let result2 = await query(
      `Delete from charge_info WHERE service_id = ${id};`
    );

    let result5 = await query(`SELECT * from service_codes WHERE id= ${id};`);

    console.log("heewqw", result5[0]);

    let result4 = await query(
      `INSERT INTO service_codes_history (short_code, code_title, code_description, has_menu, action_id, is_chargable, parent_id , session_timeout, is_whitelist, is_normal, previous_option, fixed, relative, created_by) VALUES
      ('${result5[0].short_code}', '${result5[0].code_title}','${result5[0].code_description}', ${result5[0].has_menu}, ${result5[0].action_id}, ${result5[0].is_chargable}, ${result5[0].parent_id}, ${result5[0].session_timeout}, false, false , '${result5[0].previous_option}', ${result5[0].fixed}, ${result5[0].relative} ,'${req.headers.enduser}');`
    );

    let result6 = await query(
      `Delete from bank_info WHERE short_code='${result5[0].short_code}';`
    );

    let result = await query(`Delete from service_codes WHERE id = ${id};`);
    let resultRegexPattern = await query(`Delete from regex_patterns WHERE short_code = '${short_code}';`);
    let resultExclusivePattern = await query(`Delete from exclusive_list WHERE short_code = '${short_code}';`);

    let result3 = await query(
      `UPDATE menu SET status=-100 WHERE service_code_id = ${id};`
    );

    if (
      result.code ||
      result5.code ||
      result3.code ||
      result4.code ||
      result2.code ||
      result6.code
    ) {
      logger.error(
        "[deleteServiceCode][error]",
        result.code ||
          result5.code ||
          result3.code ||
          result4.code ||
          result2.code ||
          result6.code
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }
    logger.info("[deleteServiceCode][response]", {
      success: true,
      data: result,
    });
    res.json({
      success: true,
      message: "Service code deleted successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[deleteServiceCode][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};
