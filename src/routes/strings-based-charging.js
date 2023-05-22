module.exports = (router, controller) => {
  router.get("/getStringsBasedCharging", controller.getStringsBasedCharging);
  router.post("/addStringsBasedCharging", controller.addStringsBasedCharging);
  router.put("/editStringsBasedCharging", controller.editStringsBasedCharging);
  router.delete(
    "/deleteStringsBasedCharging/:id",
    controller.deleteStringsBasedCharging
  );
  router.get("/getExclusiveList", controller.getExclusiveList);
  router.post("/addExclusiveList", controller.addExclusiveList);
  router.put("/editExclusiveList", controller.editExclusiveList);
  router.delete(
    "/deleteExclusiveList/:id",
    controller.deleteExclusiveList
  );
};
