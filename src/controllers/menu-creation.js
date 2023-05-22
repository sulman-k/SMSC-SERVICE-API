const { json } = require("body-parser");
const { query, connection } = require("../config/sqlDatabase");
const moduleName = "[menu-creation]",
  logger = require(`${__utils}/logger/logger`)(moduleName);

exports.addMenu = async (req, res, next) => {
  // const conn = await connection();
  // let { beginTransaction, commit, rollback, end } = conn;

  try {
    logger.info("[addMenu][body]", req.body);
    // await beginTransaction();

    let {
      press_options,
      service_code_id,
      is_whitelist,
      is_normal,
      menuListCheck,
      treeWidth,
      treeHeight,
      white_list_group_id,
    } = req.body;

    if (is_normal !== null) {
      let is_saved = await query(
        `UPDATE service_codes set is_whitelist =${is_whitelist} , is_normal=${is_normal},tree_width = '${treeWidth}' , tree_height = '${treeHeight}',white_list_group_id=${white_list_group_id} WHERE id = ${service_code_id}`
      );
      if (is_saved.code) {
        // await rollback();

        return res
          .status(422)
          .json({ success: false, message: "Invalid data." });
      }
    }

    if (
      !press_options &&
      !service_code_id &&
      !is_normal &&
      !is_whitelist &&
      !menuListCheck
    ) {
      // await rollback();

      return res.status(422).json({ success: false, message: "Invalid data." });
    }

    if (is_normal == null && is_whitelist == null) {
      await query(
        `INSERT INTO campaign_menu (id, camp_shortcode) VALUES (${service_code_id}, 'camp_${service_code_id}')`
      );

      function recurse(press_options) {
        for (let obj of press_options) {
          obj.short_code_dtmf = obj.short_code_dtmf.replace(
            req.body.camp_menu_name,
            `camp_${service_code_id}`
          );

          if (obj.press_options.length > 0) {
            recurse(obj.press_options);
          }
        }
      }

      recurse(press_options);
    }

    await addUpdateTree(
      is_normal,
      menuListCheck,
      service_code_id,
      press_options,
      req
    );

    // await commit();
    // await end();

    logger.info("[addMenu][response]", {
      success: true,
      message: "Menu created successfully",
    });
    res.status(200).json({
      success: true,
      message: "Menu created successfully",
    });
  } catch (error) {
    logger.error("[addMenu][error]", error);
    // await rollback();

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMenu = async (req, res, next) => {
  // const conn = await connection();
  // let { beginTransaction, commit, rollback, end } = conn;
  try {
    logger.info("[updateMenu][body]", req.body);
    // await beginTransaction();

    let {
      press_options,
      service_code_id,
      menuListCheck,
      treeWidth,
      treeHeight,
    } = req.body;

    if (!press_options && !service_code_id && !is_whitelist) {
      logger.error("[updateMenu][error]", {
        success: false,
        message: "Invalid data.",
      });

      return res.status(203).json({ success: false, message: "Invalid data." });
    }

    let result = await query(
      `DELETE FROM menu WHERE service_code_id=${service_code_id} AND is_whitelist=${menuListCheck}`
    );

    let result2 = await query(
      `DELETE FROM charge_info WHERE service_id=${service_code_id} AND menu_id>0 AND is_whitelist=${menuListCheck}`
    );

    if (result.code || result2.code) {
      logger.error("[updateMenu][error]", result.code || result2.code);
      // await rollback();

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    await addUpdateTree(
      true,
      menuListCheck,
      service_code_id,
      press_options,
      req
    );
    // await commit();
    // await end();
    logger.info("[updateMenu][response]", {
      success: true,
      message: "Menu Updated successfully",
    });
    res.status(200).json({
      success: true,
      message: "Menu Updated successfully",
    });
  } catch (error) {
    logger.error("[updateMenu][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getMenus = async (req, res, next) => {
  try {
    logger.info("[getMenus][controller]");

    // let result =
    //   await query(`SELECT menu.service_code_id ,code_title, short_code,service_codes.is_whitelist,is_normal
    // FROM menu
    //     left join service_codes ON menu.service_code_id=service_codes.id WHERE menu.created_by='${req.headers.enduser}' AND status=100
    // group by menu.service_code_id`);

    let result = await query(`
    SELECT menu.service_code_id ,code_title, short_code,service_codes.is_whitelist,is_normal,service_codes.white_list_group_id
    FROM menu 
left join service_codes ON menu.service_code_id=service_codes.id 
WHERE status=100
    group by menu.service_code_id
    `);

    if (result.code) {
      logger.error("[getMenus][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }
    logger.info("[getMenus][response]", {
      success: true,
      data: result,
    });

    //send response
    res.status(200).json({
      success: true,
      message: "Main Menus",
      data: result,
    });
  } catch (error) {
    logger.error("[getMenus][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMenuById = async (req, res, next) => {
  try {
    logger.info("[getMenuById][params]", req.params);

    let whitelist_check = req.params.flag;
    whitelist_check = JSON.parse(whitelist_check);

    let mainMenuArray = await query(
      `SELECT * FROM menu WHERE service_code_id=${
        req.params.id
      } AND is_whitelist=${whitelist_check} AND status=${100} 
      ORDER BY menu_press_options;`
    );

    let chargeInfoArray = await query(
      `SELECT * FROM charge_info WHERE service_id=${req.params.id} AND is_whitelist=${whitelist_check}`
    );
    let treeWidthHeight = await query(
      `SELECT tree_width,tree_height from service_codes where id=${req.params.id}`
    );

    if (mainMenuArray.code || chargeInfoArray.code || treeWidthHeight.code) {
      logger.error(
        "[getMenuById][error]",
        mainMenuArray.code || chargeInfoArray.code || treeWidthHeight.code
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    mainMenuArray.push({
      id: "shortcode",
      menu_item_text: "Short Code Here",
      short_code_id: req.params.id,
      parent_id: null,
      short_code_dtmf: "Code",
      menuListCheck: whitelist_check,
    });

    for (let obj of mainMenuArray) {
      if (obj.parent_id == 0) obj.parent_id = "shortcode";
      if (obj.is_whitelist) {
        obj.menu_item_text = obj.wl_menu_item_text;
      }

      for (let val of chargeInfoArray) {
        if (val.menu_id == obj.id) {
          Object.assign(obj, {
            amount: val.amount,
            charge_type: val.charge_type,
          });
        }
      }
    }

    logger.info("[getMenuById][response]", {
      success: true,
      message: "Menu created successfully",
      data: mainMenuArray,
      treeDiemenstions: treeWidthHeight,
    });

    res.status(200).json({
      success: true,
      message: "Menu created successfully",
      data: mainMenuArray,
      treeDiemenstions: treeWidthHeight,
    });
  } catch (error) {
    logger.error("[getMenuById][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};
exports.cloneMenuById = async (req, res, next) => {
  try {
    logger.info("[cloneMenuById][params]", req.params);

    let whitelist_check = req.params.flag;
    whitelist_check = JSON.parse(whitelist_check);

    let mainMenuArray = await query(
      `insert into menu SELECT id,action_id ,camp_menu_id,optional_sms,sms_text,redis_flag,has_menu,is_chargeable ,
      is_whitelist,menu_item_text,parent_id , ${req.params.updatedId} as service_code_id, 
      replace(short_code_dtmf , substr(short_code_dtmf,1,instr(short_code_dtmf,'+')-1),
      (select short_code from service_codes where id = ${req.params.updatedId} )) as short_code_dtmf,timeout ,wl_menu_item_text ,
      created_dt,created_by,camp_flag ,status,consent ,is_bank_short_code,bank_id ,
      is_transferable ,transfer_ussdString ,esme_protocol ,service_code_flow ,menu_unique ,
      menu_press_options,user_input_response ,take_user_input ,user_input,is_package_code ,
      package_code_text ,is_3p_num ,is_consent,consent_text,is_root ,is_key_value,key_value ,
      constructed_string,is_input,input_level ,input_1 ,input_2 ,input_3 ,input_4 ,input_5 ,sms_number,
      sms_number_text ,is_sensitive,slice_intervals FROM menu WHERE service_code_id =${req.params.existingId} 
      AND is_whitelist=${whitelist_check} AND status=100`
    );

    if (mainMenuArray.code) {
      logger.error(
        "[cloneMenuById][error]",
        mainMenuArray.code 
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[cloneMenuById][response]", {
      success: true,
      message: "Menu created successfully",
      data: mainMenuArray,
    });

    res.status(200).json({
      success: true,
      message: "Menu created successfully",
      data: mainMenuArray,
    });
  } catch (error) {
    logger.error("[cloneMenuById][error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCampaignMenu = async (req, res, next) => {
  try {
    logger.info("[getCampaignMenu][params]", req.params);

    let mainMenuArray = await query(
      `SELECT * FROM menu WHERE camp_menu_id=${req.params.id} ORDER BY menu_press_options;`
    );

    if (mainMenuArray.code) {
      logger.error("[getCampaignMenu][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    mainMenuArray.push({
      id: "shortcode",
      menu_item_text: "Short Code Here",
      short_code_id: req.params.id,
      parent_id: null,
      short_code_dtmf: "Code",
    });

    for (let obj of mainMenuArray) {
      if (obj.parent_id == 0) obj.parent_id = "shortcode";
    }

    logger.info("[getCampaignMenu][response]", {
      success: true,
      message: "Menu created successfully",
      data: mainMenuArray,
    });

    res.status(200).json({
      success: true,
      message: "Menu created successfully",
      data: mainMenuArray,
    });
  } catch (error) {
    logger.error("[getCampaignMenu][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMenu = async (req, res, next) => {
  try {
    logger.info("[deleteMenu][body]", req.body);

    let { service_code_id, is_whitelist } = req.body;
    let menu = await query(
      `UPDATE menu SET status=${-100} WHERE service_code_id=${service_code_id} AND is_whitelist=${is_whitelist}`
    );

    let service;
    if (is_whitelist==1)
    {
      service = await query(
        `UPDATE service_codes SET is_whitelist=0, white_list_group_id=0 WHERE id=${service_code_id};`
      );
    }
    else{
      service= await query(
        `UPDATE service_codes SET is_normal=0 WHERE id=${service_code_id};`
      );
    }

    if (menu.code || service.code) {
      logger.error("[deleteMenu][error]", menu.code || service.code);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }
    logger.info("[deleteMenu][response]", {
      success: true,
      message: "Menu deleted successfully",
    });

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    logger.error("[deleteMenu][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFlowCodes = async (req, res, next) => {
  try {
    logger.info("[getNormalFlowCodes][query]", req.query);

    let col_name = "is_whitelist";
    if (req.query.flow == false) col_name = "is_normal";

    let result = await query(
      `SELECT short_code, id, is_normal, is_whitelist from service_codes WHERE ${col_name}=1 OR action_id > 0 OR is_bank_short_code=1 `
    );

    if (result.code) {
      logger.error("[getNormalFlowCodes][error]", menu);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[getNormalFlowCodes][response]", {
      success: true,
      data: result,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("[getNormalFlowCodes][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDtmfsById = async (req, res, next) => {
  try {
    logger.info("[getDtmfsById][query]", req.query);

    let result = await query(
      `SELECT short_code_dtmf from menu WHERE service_code_id=${req.query.id} AND is_whitelist=${req.query.flow} AND status=100`
    );

    if (result.code) {
      logger.error("[getDtmfsById][error]", menu);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    let dtmfs = [];
    for (let val of result) {
      dtmfs.push(val.short_code_dtmf);
    }

    logger.info("[getDtmfsById][response]", {
      success: true,
      data: dtmfs,
    });

    res.status(200).json({
      success: true,
      data: dtmfs,
    });
  } catch (error) {
    logger.error("[getDtmfsById][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

addUpdateTree = async (
  is_normal,
  menuListCheck,
  service_code_id,
  press_options,
  req
) => {
  //adding value to text column based on flag
  let text_col_name = "menu_item_text";
  if (menuListCheck) text_col_name = "wl_menu_item_text";

  let camp_or_service_id = "service_code_id";
  if (is_normal == null) camp_or_service_id = "camp_menu_id";
  //parent function
  async function parent(a) {
    if (a.press_options) {
      a.key_value = JSON.stringify(a.key_value);

      //insert futher childs
      let childNode = await query(
        `INSERT INTO menu (${text_col_name}, short_code_dtmf,  ${camp_or_service_id}, parent_id, has_menu, 
          action_id ,esme_protocol, is_whitelist, sms_text, optional_sms, is_chargeable, is_transferable, transfer_ussdString, 
          service_code_flow, menu_unique, menu_press_options, take_user_input, is_package_code, package_code_text, 
          is_3p_num, is_consent, consent_text, user_input, is_key_value, key_value, constructed_string, 
          is_root, is_input, input_level, input_1, input_2, input_3, input_4, input_5,sms_number,sms_number_text,
          is_sensitive,slice_intervals, created_by) VALUES 
          ('${a.menu_item_text}', '${
          a.short_code_dtmf
        }',  ${service_code_id}, ${a.parent_id},${a.has_menu}, 
          ${a.action_id},${a.esme_protocol},${menuListCheck},${a.sms_text},'${
          a.optional_sms
        }', ${a.is_chargeable}, 
          ${a.is_transferable}, '${a.transfer_ussdString}', ${
          a.service_code_flow
        }, '${a.menu_unique || null}',${a.menu_press_options || 0}, ${
          a.take_user_input || 0
        },${a.is_package_code || 0}, '${a.package_code_text || null}', ${
          a.is_3p_num || 0
        }, ${a.is_consent || 0}, '${a.consent_text || null}', '${
          a.user_input || null
        }',  ${a.is_key_value || 0}, '${a.key_value || null}', '${
          a.constructed_string || null
        }', ${a.is_root || 0}, ${a.is_input}, ${a.input_level}, '${
          a.input_message[0]
        }', '${a.input_message[1]}', '${a.input_message[2]}', '${
          a.input_message[3]
        }', '${a.input_message[4]}', '${a.sms_number}','${a.sms_number_text}',${a.is_sensitive},
        '${a.slice_intervals}','${
          req.headers.enduser
        }');`
      );

      //if a leaf node is chargable
      if (a.is_chargeable) {
        await query(
          `INSERT INTO charge_info (amount, charge_type, is_whitelist, menu_id, service_id) VALUES (${a.amount}, ${a.charge_type}, ${menuListCheck}, ${childNode.insertId}, ${service_code_id});`
        );
      }

      for (let b of a.press_options) {
        //assign parent id to child
        Object.assign(b, { parent_id: childNode.insertId });
        parent(b);
      }
    }
    //insert to submenu
    if (!a.press_options) {
      //push leaf nodes which dont have any childs
      a.key_value = JSON.stringify(a.key_value);

      let leafNode = await query(
        `INSERT INTO menu (${text_col_name}, short_code_dtmf,  ${camp_or_service_id}, parent_id, 
          has_menu, action_id ,esme_protocol, is_whitelist, sms_text, optional_sms, is_chargeable, 
          is_transferable, transfer_ussdString, service_code_flow, menu_unique, menu_press_options, take_user_input, 
          is_package_code, package_code_text, is_3p_num, is_consent, consent_text, user_input, is_key_value, 
          key_value, constructed_string, is_root, is_input, input_level, input_1, input_2, input_3, input_4,
           input_5,sms_number,sms_number_text,is_sensitive,slice_intervals, created_by) VALUES 
        ('${a.menu_item_text}', '${a.short_code_dtmf}',  ${service_code_id}, ${
          a.parent_id
        }, ${a.has_menu}, 
        ${a.action_id},${a.esme_protocol},${menuListCheck},${a.sms_text},'${
          a.optional_sms
        }', ${a.is_chargeable}, 
        ${a.is_transferable}, '${a.transfer_ussdString}', ${
          a.service_code_flow
        }, '${a.menu_unique || null}',${a.menu_press_options || 0}, ${
          a.take_user_input || 0
        },${a.is_package_code || 0}, '${a.package_code_text || null}', ${
          a.is_3p_num || 0
        }, ${a.is_consent || 0}, '${a.consent_text || null}', '${
          a.user_input || null
        }', ${a.is_key_value || 0}, '${a.key_value || null}', '${
          a.constructed_string || null
        }', ${a.is_root || 0}, ${a.is_input}, ${a.input_level}, '${
          a.input_message[0]
        }', '${a.input_message[1]}', '${a.input_message[2]}', '${
          a.input_message[3]
        }', '${a.input_message[4]}', '${a.sms_number}','${a.sms_number_text}',${a.is_sensitive},'${a.slice_intervals}','${
          req.headers.enduser
        }');`
      );
      // console.log("leafffffff", a.press_options);

      //if a leaf node is chargable
      if (a.is_chargeable) {
        await query(
          `INSERT INTO charge_info (amount, charge_type, is_whitelist, menu_id, service_id) VALUES (${a.amount}, ${a.charge_type}, ${menuListCheck}, ${leafNode.insertId}, ${service_code_id});`
        );
      }
    }
  }

  for (let a of press_options) {
    a.key_value = JSON.stringify(a.key_value);
    //push parent nodes
    let result = await query(
      `INSERT INTO menu (${text_col_name}, short_code_dtmf,  ${camp_or_service_id}, parent_id, 
        has_menu, action_id ,esme_protocol, is_whitelist, sms_text, optional_sms, is_chargeable, is_transferable, 
        transfer_ussdString, service_code_flow, menu_unique, menu_press_options, take_user_input, is_package_code, 
        package_code_text, is_3p_num, is_consent, consent_text, user_input, is_key_value, key_value, 
        constructed_string, is_root, is_input, input_level, input_1, input_2, input_3, input_4, input_5,
        sms_number,sms_number_text,is_sensitive,slice_intervals, created_by) VALUES 
        ('${a.menu_item_text}', '${
        a.short_code_dtmf
      }', ${service_code_id}, 0, ${a.has_menu} , ${a.action_id}, ${
        a.esme_protocol
      },
        ${menuListCheck},${a.sms_text},'${a.optional_sms}', ${
        a.is_chargeable
      }, ${a.is_transferable}, '${a.transfer_ussdString}', ${
        a.service_code_flow
      }, '${a.menu_unique || null}',${a.menu_press_options || 0}, ${
        a.take_user_input || 0
      },${a.is_package_code || 0}, '${a.package_code_text || null}', ${
        a.is_3p_num || 0
      }, ${a.is_consent || 0}, '${a.consent_text || null}', '${
        a.user_input || null
      }', ${a.is_key_value || 0}, '${a.key_value || null}', '${
        a.constructed_string || null
      }', ${a.is_root || 0}, ${a.is_input}, ${a.input_level}, '${
        a.input_message[0]
      }', '${a.input_message[1]}', '${a.input_message[2]}', '${
        a.input_message[3]
      }', '${a.input_message[4]}','${a.sms_number}','${a.sms_number_text}',${a.is_sensitive},'${a.slice_intervals}',
      '${req.headers.enduser}');`
    );

    // console.log("yeeeee", this.result);

    //total number of menus a service have
    await query(
      `UPDATE service_codes SET max_segments=${press_options.length} ,tree_width = '${req.body.treeWidth}',tree_height='${req.body.treeHeight}',white_list_group_id='${req.body.white_list_group_id}' WHERE id=${service_code_id};`
    );

    //if a parent node is chargeable
    if (a.is_chargeable) {
      await query(
        `INSERT INTO charge_info (amount, charge_type, is_whitelist, menu_id, service_id) VALUES (${a.amount}, ${a.charge_type}, ${menuListCheck}, ${result.insertId}, ${service_code_id});`
      );
    }

    for (let b of a.press_options) {
      //assigning parent id to childs and making fuction recursive
      Object.assign(b, { parent_id: result.insertId });
      parent(b);
    }
  }
};
exports.downloadMenus = async (req, res, next) => {
  try {
    logger.info("[downloadMenus][controller]");

    // let result =
    //   await query(`SELECT menu.service_code_id ,code_title, short_code,service_codes.is_whitelist,is_normal
    // FROM menu
    //     left join service_codes ON menu.service_code_id=service_codes.id WHERE menu.created_by='${req.headers.enduser}' AND status=100
    // group by menu.service_code_id`);

    let result = await query(`select * from ( select ifnull(menu_item_text,wl_menu_item_text) as menu_text, ed.esme_name,'SMPP' as protocol,
    package_code_text as USSD_INFO, short_code_dtmf, transfer_ussdString as transfer_short_code_dtmf
    from menu
    join esme_detail ed on menu.action_id = ed.esme_id and menu.esme_protocol = 1
    where status = 100 and service_code_id<>0
    Union
    select ifnull( menu_item_text,wl_menu_item_text ) as menu_text, esd.esme_name, 'HTTP' as protocol,
    package_code_text as USSD_INFO, short_code_dtmf,transfer_ussdString as transfer_short_code_dtmf
    from menu
    join esme_soap_details esd on menu.action_id = esd.id and menu.esme_protocol = 2
    where status = 100 and service_code_id<>0
    Union
    select ifnull( menu_item_text,wl_menu_item_text ) as menu_text, '' as esme_name, '' as protocol,
    package_code_text as USSD_INFO,short_code_dtmf, transfer_ussdString as transfer_short_code_dtmf
    from menu
    where menu.esme_protocol = 0 and status = 100 and service_code_id<>0
    Union
    select ifnull( menu_item_text,wl_menu_item_text ) as menu_text, 'SMS' as esme_name, 'SMS' as protocol,
    package_code_text as USSD_INFO,short_code_dtmf, transfer_ussdString as transfer_short_code_dtmf
    from menu
    where menu.esme_protocol = 3 and status = 100 and service_code_id<>0 ) as a
    order by short_code_dtmf;`
    );

    if (result.code) {
      logger.error("[downloadMenus][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }
    logger.info("[downloadMenus][response]", {
      success: true,
      data: result,
    });

    //send response
    res.status(200).json({
      success: true,
      message: "Main Menus",
      data: result,
    });
  } catch (error) {
    logger.error("[downloadMenus][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

