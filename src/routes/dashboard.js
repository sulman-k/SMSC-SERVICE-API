module.exports = (router, controller) => {
  router.get("/serviceCounts", controller.serviceCounts);
  router.get("/dateWiseServices", controller.dateWiseServices);
  router.get("/esmeDetails", controller.esmeDetails);
  router.get("/treeDetails", controller.treeDetails);
  router.get("/getProfile", controller.getProfile);
};
