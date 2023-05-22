module.exports = (router, controller) => {
  router.post("/addMenu", controller.addMenu);
  router.post("/updateMenu", controller.updateMenu);
  router.get("/getMenus", controller.getMenus);
  router.get("/downloadMenus", controller.downloadMenus);
  router.get("/getMenuById/:id/:flag", controller.getMenuById);
  router.get("/cloneMenuById/:existingId/:updatedId/:flag", controller.cloneMenuById);
  router.get("/getCampaignMenu/:id", controller.getCampaignMenu);
  router.put("/deleteMenu", controller.deleteMenu);
  router.get("/getFlowCodes", controller.getFlowCodes);
  router.get("/getDtmfsById", controller.getDtmfsById);
};
