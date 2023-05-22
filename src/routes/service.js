module.exports = (router, controller) => {
  router.get("/getServiceCodes", controller.getServiceCodes);
  router.get("/getCampaignEsmeNames", controller.getCampaignEsmeNames);  
  router.get("/getWhiteListGroups", controller.getWhiteListGroups);
  router.post("/addServiceCode", controller.addServiceCode);
  router.put("/updateServiceCode/:id", controller.updateServiceCode);
  router.delete("/deleteServiceCode", controller.deleteServiceCode);
  router.get("/getHttpSmppConf/:type", controller.getHttpSmppConf);
};
