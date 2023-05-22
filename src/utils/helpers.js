const moduleName = "[Helper]",
  //   request = require("request"),
  jwt_decode = require("jwt-decode"),
  logger = require(`${__utils}/logger/logger`)(moduleName),
  axios = require("axios");
//   parseString = require("xml2js").parseString;

exports.getSOAPKeySubstring = async (string) => {
  let str = Object.keys(string);
  for (let s of str) {
    if (s.includes(":tenantId")) {
      str = s.split(":")[0];
      break;
    }
  }
  return str;
};

// exports.Request = async (options) => {
//   return new Promise((resolve) => {
//     request(options, function (error, response, body) {
//       if (error) {
//         logger.error("[POSTRequest][Error]", error);
//         throw new Error(error.message);
//       } else if (response.statusCode === 401) {
//         logger.error("[POSTRequest][Error]", "Unauthorized User.");
//         throw new Error("Unauthorized User.");
//       } else resolve({ response, body });
//     });
//   });
// };

// exports.parse = async (string) => {
//   return new Promise((resolve) => {
//     parseString(string, { explicitArray: false }, async function (err, result) {
//       if (err) throw new Error(err);
//       else resolve(result);
//     });
//   });
// };

exports.mapCountryName = async (allVerifications, countries) => {
  try {
    for (let v of allVerifications) {
      let cObj = countries.find((c) => c.dialing_code == v.dialing_code);
      v.country_name = cObj.name;
    }
    return allVerifications;
  } catch (e) {
    logger.error("[Map Region Country Name Function][error]", e);
    return {
      success: false,
      msg: e.message,
    };
  }
};

let accessToken;
exports.getUserProfile = (req, token = {}) => {
  const CLAIM_URI = "http://wso2.org/claims";
  const user_profile = jwt_decode(token);
  accessToken = token;
  // const user_profile = jwt_decode(
  //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5UZG1aak00WkRrM05qWTBZemM1TW1abU9EZ3dNVEUzTVdZd05ERTVNV1JsWkRnNE56YzRaQT09In0.eyJhdWQiOiJodHRwOlwvXC9vcmcud3NvMi5hcGltZ3RcL2dhdGV3YXkiLCJzdWIiOiJhZG1pbkBnbG8uY29tIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJhZG1pbiIsInRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjoyLCJ1dWlkIjpudWxsfSwic2NvcGUiOiJkZWZhdWx0IiwiaXNzIjoiaHR0cHM6XC9cLzE5Mi4xNjguMi40MTo5NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiVW5saW1pdGVkIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOm51bGx9fSwia2V5dHlwZSI6IlBST0RVQ1RJT04iLCJzdWJzY3JpYmVkQVBJcyI6W3sic3Vic2NyaWJlclRlbmFudERvbWFpbiI6Imdsby5jb20iLCJuYW1lIjoiQ2FtcGFpZ24iLCJjb250ZXh0IjoiXC9jYW1wYWlnblwvMSIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6IjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiVW5saW1pdGVkIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiZ2xvLmNvbSIsIm5hbWUiOiJSZXBvcnRpbmciLCJjb250ZXh0IjoiXC9yZXBvcnRpbmdcLzEiLCJwdWJsaXNoZXIiOiJhZG1pbiIsInZlcnNpb24iOiIxIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6Imdsby5jb20iLCJuYW1lIjoiU2VydmljZSIsImNvbnRleHQiOiJcL3NlcnZpY2VcLzEiLCJwdWJsaXNoZXIiOiJhZG1pbiIsInZlcnNpb24iOiIxIiwic3Vic2NyaXB0aW9uVGllciI6IlVubGltaXRlZCJ9XSwiY29uc3VtZXJLZXkiOiI3UW5RVjZONl9rYjJZcURXOHJRa3FFeVBfcG9hIiwiZXhwIjoxNjQzNzIzOTgyLCJpYXQiOjE2NDM3MjAzODIsImp0aSI6IjgzZWUwMGYyLTcyZGYtNGM2MC05Mzc2LWRjOWE3YWY3ZmExZCJ9.w9-90TzqyRDa4FVrZSWe0UxCm5fDykfeA6uEtqT4wBXN42cr_1RpIBFPlp-GTXbfv1uBTitsWEWmwKcGBZ8MRk800ED5tk4kS0bEg8bTfK1fZXm8MyRJ2o0ORYwfvkSLRhDFhlM_F5UqIEox16ovVi_OmIRmX1-IW39-24cN1fPuguWXFmdFBZRvw0Va7xmyQrxiqfgekgEQ_uQHN6Pi9PtbV0hK9GqjBOaDnaD5Dz7Y-ljFSu9UzxOxfwy83boybUkCm4xR6noAbhaiR_fecOLbQfmZfwXGxt0L-4fVSJjfVdkxx0xXZPMEj-15RM4WYuyXDV2aS-Kzgol-Xq39cg"
  // );

  req.headers.enduser = user_profile[CLAIM_URI + "/enduser"];
  req.headers.scope = user_profile["scope"];

  req.headers.enduser ? null : (req.headers.enduser = "admin@glo.com");

  const is_admin = req.headers.scope.includes("campaign-admin");
  req.headers.is_admin = is_admin;

  return;
};

exports.mapOperatorName = async (data, opt) => {
  try {
    for (let d of data) {
      for (let o of opt) {
        let _obj = o.code.find((c) => c.code == d.operator_code);
        if (_obj) {
          d.operator_name = o.name;
          console.log(d);
        }
      }
    }

    return data;
  } catch (e) {
    logger.error("[Map Operator Name Function][error]", e);
    return {
      success: false,
      msg: e.message,
    };
  }
};

exports.getHttpConf = async () => {
  let response = await axios({
    method: "get",
    url: `http://${process.env.ADMIN_HOST}:${process.env.ADMIN_PORT}/api/v1/getHttpConfigs`,
    headers: {
      Authorization: accessToken,
    },
  });

  return response.data;
};

exports.updateActiveStatus = async (smpp, http) => {
  let response = await axios({
    method: "put",
    url: `http://${process.env.ADMIN_HOST}:${process.env.ADMIN_PORT}/api/v1/updateActiveStatus`,
    data: {
      smpp: smpp,
      http: http,
    },
    headers: {
      Authorization: accessToken,
    },
  });

  return response.data;
};

exports.getSmppConf = async () => {
  let response = await axios({
    method: "get",
    url: `http://${process.env.ADMIN_HOST}:${process.env.ADMIN_PORT}/api/v1/getEsmeConfiguration`, //getSmppPorts
    headers: {
      Authorization: accessToken,
    },
  });

  return response.data;
};
// exports.getWLGroups = async () => {
//   let response = await axios({
//     method: "get",
//     url: `http://${process.env.ADMIN_HOST}:${process.env.ADMIN_PORT}/api/v1/getWhiteListGroups`,
//     headers: {
//       Authorization: accessToken,
//     },
//   });
//   return response.data;
// };
