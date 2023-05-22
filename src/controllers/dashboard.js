const { query } = require("../config/sqlDatabase");
var moment = require("moment"); // require
const moduleName = "[dashboard]",
  logger = require(`${__utils}/logger/logger`)(moduleName);

exports.serviceCounts = async (req, res, next) => {
  try {
    logger.info("[serviceCounts][controller]");

    let chargable = await query(
      `SELECT COUNT(*) AS chargeable_count FROM service_codes WHERE is_chargable=1 `
    );
    let esme = await query(
      `SELECT COUNT(*) AS esme_count FROM service_codes WHERE action_id=1 `
    );
    let menu = await query(
      `SELECT COUNT(*) AS has_menu_count FROM service_codes WHERE has_menu=1 `
    );

    let sub_service = await query(
      `SELECT COUNT(*) AS sub_services FROM service_codes WHERE parent_id > 0 `
    );
    let service = await query(
      `SELECT COUNT(*) AS services FROM service_codes WHERE parent_id=0 `
    );

    if (
      chargable.code ||
      esme.code ||
      menu.code ||
      sub_service.code ||
      service.code
    ) {
      logger.error(
        "[serviceCounts][error]",
        chargable.code ||
          esme.code ||
          menu.code ||
          sub_service.code ||
          service.code
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    let count = [
      Object.assign(
        chargable[0],
        esme[0],
        menu[0],
        sub_service[0],
        menu[0],
        service[0]
      ),
    ];

    logger.info("[serviceCounts][response]", {
      success: true,
      data: count,
    });

    res.json({ success: true, data: count });
  } catch (error) {
    logger.error("[serviceCounts][error]", error);

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.dateWiseServices = async (req, res) => {
  try {
    logger.info("[dateWiseServices][query]", req.query);

    let chargable = await query(`SELECT DATE(created_dt) AS x, COUNT(*) AS y 
      FROM service_codes where is_chargable=1 AND created_dt 
      BETWEEN '${req.query.st_dt}' AND '${req.query.end_dt}' 
      GROUP BY DATE(created_dt) `);

    let esme = await query(`SELECT DATE(created_dt) AS x, COUNT(*) AS y 
      FROM service_codes where action_id=1 AND created_dt 
      BETWEEN '${req.query.st_dt}' AND '${req.query.end_dt}' 
      GROUP BY DATE(created_dt) `);

    let has_menu = await query(`SELECT DATE(created_dt) AS x, COUNT(*) AS y 
      FROM service_codes where has_menu=1 AND created_dt 
      BETWEEN '${req.query.st_dt}' AND '${req.query.end_dt}' 
      GROUP BY DATE(created_dt) `);

    if (chargable.code || has_menu.code || esme.code) {
      logger.error(
        "[dateWiseServices][error]",
        chargable.code || has_menu.code || esme.code
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }
    // chargable = _.difference(chargable, ["meta"]);
    for (let r of chargable) {
      const d = new Date(r.x);
      const x = moment(d).format("YYYY-MM-DD");
      r.x = x;
    }

    // esme = _.difference(esme, ["meta"]);
    for (let r of esme) {
      const d = new Date(r.x);
      const x = moment(d).format("YYYY-MM-DD");
      r.x = x;
    }

    // has_menu = _.difference(has_menu, ["meta"]);
    for (let r of has_menu) {
      const d = new Date(r.x);
      const x = moment(d).format("YYYY-MM-DD");
      r.x = x;
    }

    let dateWiseData = [
      {
        chargable: chargable,
        esme: esme,
        has_menu: has_menu,
      },
    ];

    logger.info("[dateWiseServices][response]", {
      success: true,
      data: dateWiseData,
    });

    res.send({
      success: true,
      data: dateWiseData,
    });
  } catch (error) {
    logger.error("[dateWiseServices][error]", error);

    res.status(500).send({ success: false, error: error });
  }
};

exports.esmeDetails = async (req, res) => {
  try {
    logger.info("[esmeDetails][query]", req.query);

    let result = await query(
      `SELECT COUNT(*) AS total, protocol FROM esme_configuration GROUP BY protocol`
    );
    if (result.code) {
      logger.error("[esmeDetails][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[esmeDetails][response]", {
      success: true,
      data: result,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("[esmeDetails][error]", error);
    res.status(500).json({ success: false, error: error });
  }
};

exports.treeDetails = async (req, res) => {
  try {
    logger.info("[treeDetails][query]", req.query);

    // let result = await query(
    //   `SELECT COUNT(DISTINCT(is_whitelist)) AS total FROM menu GROUP BY service_code_id`
    // );
    let result = await query(`select 
(SELECT COUNT(DISTINCT(service_code_id)) as White FROM menu where is_whitelist = 0 ) AS WhiteList,
(SELECT COUNT(DISTINCT(service_code_id)) as White FROM menu where is_whitelist = 1 )  AS List`);
    if (result.code) {
      logger.error("[treeDetails][error]", result);

      return res
        .status(400)
        .json({ success: false, message: "Invalid Query/Data!" });
    }

    logger.info("[treeDetails][response]", {
      success: true,
      data: result,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("[treeDetails][error]", error);
    res.status(500).json({ success: false, error: error });
  }
};

exports.getProfile = async (req, res) => {
  // logger.info("[updateCredential][params]", req.params);
  // let token = req.headers.enduser;
  // console.log("tok", token);
  // let { email, new_password, old_password } = req.body;
  // const emailArray = email.split("@");

  let updateCredentialBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.ws.um.carbon.wso2.org">
  <soapenv:Header/>
  <soapenv:Body>
  <ser:getUserClaimValues>
  <!--Optional:-->
  <ser:userName>admin</ser:userName>
  <!--Optional:-->
  </ser:getUserClaimValues>
  </soapenv:Body>
  </soapenv:Envelope>`;

  const updateCredentialOptions = {
    // Request Options to update credential
    method: "POST",
    url: config.adminUrl,
    qs: { wsdl: "" },
    headers: {
      Authorization: config.adminCredentials,
    },
    body: updateCredentialBody,
    rejectUnauthorized: false, // remove this in production, only for testing
    // ca: [fs.readFileSync([certificate path], { encoding: 'utf-8' })]
  };
  console.log("response: ");

  request(updateCredentialOptions, function (error, response, body) {
    if (error) {
      logger.error("[getUserClaimValues][Error]", error);
      return res.status(404).send(error.message);
    }
    if (response.statusCode === 401) {
      logger.warn("[getUserClaimValues][Error]", "Unauthorized User.");
      return res
        .status(401)
        .send({ success: false, data: "Unauthorized User." });
    }
    if (response.statusCode === 500) {
      return res.status(500).send({
        success: false,
        Response: "Internal server error 500",
      });
    }
    parser.parseString(body, async function (err, result) {
      let response =
        result["soapenv:Envelope"]["soapenv:Body"][0][
          "ns:getUserClaimValuesResponse"
        ][0]["ns:return"];

      let string = "http://wso2.org/claims/";
      // console.log("response: ", response);
      // console.log("err", err);

      let dataArr = {};

      // let getTenantStr = result['soapenv:Envelope']['soapenv:Body']['ns:getTenantResponse']['ns:return'];

      let str = await getSOAPKeySubstring(response[0]); // get distinct key from soap response data

      for (let obj of response) {
        // console.log("here", obj[`${str}:claimUri"][0]);

        if (obj[`${str}:claimUri`][0] == `${string}givenname`) {
          // console.log("vlaue", obj[`${str}:value"][0]);
          Object.assign(dataArr, { firstname: obj[`${str}:value`][0] });
        }
        if (obj[`${str}:claimUri`][0] == `${string}lastname`) {
          // console.log("vlaue", obj[`${str}:value`][0]);
          Object.assign(dataArr, { lastname: obj[`${str}:value`][0] });
        }
        if (obj[`${str}:claimUri`][0] == `${string}username`) {
          // console.log("vlaue", obj[`${str}:value`][0]);
          Object.assign(dataArr, { username: obj[`${str}:value`][0] });
        }
      }

      Object.assign(dataArr, { email: req.headers.enduser });

      res.status(200).send({
        success: true,
        data: dataArr,
      });

      // let getTenantStr =
      //   result["soapenv:Envelope"]["soapenv:Body"]["soapenv:Fault"]; // soap response error handling
      // let data = {
      //   faultCode: getTenantStr["faultcode"],
      //   faultString: getTenantStr["faultstring"],
      //   details: getTenantStr.detail,
      // };
      // logger.error("[getTenant][Error]", err);
      // return res.status(500).json({ success: false, data });
    });
  });
};
