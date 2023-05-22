const { query } = require("../config/sqlDatabase");
const moduleName = "[esme-configuration]",
  logger = require(`${__utils}/logger/logger`)(moduleName);
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

// exports.addEsmeConfiguration = async (req, res, next) => {
//   try {
//     logger.info("[addEsmeConfiguration][body]", req.body);

//     const {
//       body,
//       description,
//       destination_ip,
//       password,
//       port,
//       protocol,
//       requestTypeSelect,
//       requestUrl,
//       serviceName,
//       systemId,
//       is_dialog,
//       is_sponsored_charging,
//       esme_charging_msisdn,
//       esme_mo_keyword,
//       generic_message,
//       is_sms_mo,
//       esme_mo_msisdn,
//       is_subnet,
//       subnet,

//       //,created_by,
//     } = req.body;
//     if (
//       !body &&
//       !description &&
//       !destination_ip &&
//       !password &&
//       !port &&
//       !protocol &&
//       !requestTypeSelect &&
//       !requestUrl &&
//       !serviceName &&
//       !systemId &&
//       !is_dialog &&
//       !is_sponsored_charging &&
//       !esme_charging_msisdn &&
//       !is_sms_mo &&
//       !esme_mo_msisdn &&
//       !esme_mo_keyword &&
//       !generic_message &&
//       !is_subnet &&
//       !subnet
//     ) {
//       logger.error("[addEsmeConfiguration][error]", {
//         success: false,
//         message: "Invalid data.",
//       });
//       return res.status(203).json({ success: false, message: "Invalid data." });
//     }
//     let stringBody = JSON.stringify(body);
//     let stringIp = JSON.stringify(destination_ip);

//     let result = await query(
//       `INSERT INTO esme_configuration
//         (service_name, service_description, request_URL, protocol, request_type, request_body, destination_ip,
//           system_password, destination_port, system_id, is_dialog, is_sponsored_charging, esme_charging_msisdn,
//           is_sms_mo, esme_mo_msisdn, esme_mo_keyword, generic_message, is_subnet, subnet, created_by) VALUES
//         ('${serviceName}', '${description}','${requestUrl}', '${protocol}', '${requestTypeSelect}'
//         , '${stringBody}', '${stringIp}', '${password}', '${port}', '${systemId}', ${is_dialog}, ${is_sponsored_charging},
//         '${esme_charging_msisdn}', ${is_sms_mo}, '${esme_mo_msisdn}', '${esme_mo_keyword}', '${generic_message}', ${is_subnet}, '${subnet}', '${req.headers.enduser}');`
//     );

//     if (result.code) {
//       logger.error("[addEsmeConfiguration][error]", result);

//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Query/Data!" });
//     }

//     logger.info("[addEsmeConfiguration][response]", {
//       success: true,
//       data: result,
//     });
//     res.status(200).json({
//       success: true,
//       message: "Esme Configuration added successfully",
//       data: result,
//     });
//   } catch (error) {
//     logger.error("[addEsmeConfiguration][error]", error);

//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.UpdateEsmeConfiguration = async (req, res, next) => {
//   try {
//     logger.info("[UpdateEsmeConfiguration][body]", req.body);

//     let {
//       body,
//       description,
//       destination_ip,
//       password,
//       port,
//       protocol,
//       requestTypeSelect,
//       requestUrl,
//       serviceName,
//       systemId,
//       is_dialog,
//       is_sponsored_charging,
//       esme_charging_msisdn,
//       esme_mo_keyword,
//       generic_message,
//       is_sms_mo,
//       esme_mo_msisdn,
//       is_subnet,
//       subnet,
//     } = req.body;
//     body = JSON.stringify(body);
//     if (
//       !body &&
//       !description &&
//       !destination_ip &&
//       !password &&
//       !port &&
//       !protocol &&
//       !requestTypeSelect &&
//       !requestUrl &&
//       !serviceName &&
//       !systemId &&
//       !is_dialog &&
//       !is_sponsored_charging &&
//       !esme_charging_msisdn &&
//       !is_sms_mo &&
//       !esme_mo_msisdn &&
//       !esme_mo_keyword &&
//       !generic_message &&
//       !is_subnet &&
//       !subnet
//     ) {
//       return res.status(203).json({ success: false, message: "Invalid data." });
//     }

//     // (service_name, service_description, request_URL, protocol, request_type, request_body, destination_ip,
//     //   system_password, destination_port, system_id, is_dialog, created_by
//     let result = await query(
//       `UPDATE esme_configuration SET
//       service_name='${serviceName}', service_description='${description}', request_URL='${requestUrl}',
//       protocol='${protocol}', request_type='${requestTypeSelect}', request_body='${body}',
//       destination_ip='${destination_ip}', system_password='${password}',
//       destination_port=${port},system_id=${systemId},is_dialog=${is_dialog} ,is_sponsored_charging=${is_sponsored_charging}
//       ,esme_charging_msisdn='${esme_charging_msisdn}', is_sms_mo=${is_sms_mo}, esme_mo_msisdn='${esme_mo_msisdn}', esme_mo_keyword='${esme_mo_keyword}',
//       generic_message='${generic_message}', is_subnet=${is_subnet}, subnet='${subnet}' WHERE id = ${req.params.id};`
//     );

//     if (result.code) {
//       logger.error("[UpdateEsmeConfiguration][error]", result);

//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Query/Data!" });
//     }

//     logger.info("[UpdateEsmeConfiguration][response]", {
//       success: true,
//       data: result,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Esme Configuration updated successfully",
//       data: result,
//     });
//   } catch (error) {
//     logger.error("[UpdateEsmeConfiguration][error]", error);

//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.deleteEsmeConfiguration = async (req, res, next) => {
//   try {
//     logger.info("[deleteEsmeConfiguration][params]", req.params);

//     const { id } = req.params;
//     if (!id) {
//       res.status(203).json({
//         success: false,
//         message: "Invalid data.",
//       });
//     }
//     let result = await query(
//       `Delete from esme_configuration WHERE id = ${id};`
//     );
//     if (result.code) {
//       logger.error("[deleteEsmeConfiguration][error]", result);

//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Query/Data!" });
//     }

//     logger.info("[deleteEsmeConfiguration][response]", {
//       success: true,
//       data: result,
//     });
//     res.status(200).json({
//       success: true,
//       message: "Esme Configuration deleted successfully",
//       data: result,
//     });
//   } catch (error) {
//     logger.error("[deleteEsmeConfiguration][error]", error);

//     res.status(500).json({ success: false, message: error.message });
//   }
// };
