module.exports = (router, controller) => {
  router.get("/getHttpSmppConf/:type", controller.getHttpSmppConf);
  // router.post("/addEsmeConfiguration", controller.addEsmeConfiguration);
  // router.put(
  //   "/UpdateEsmeConfiguration/:id",
  //   controller.UpdateEsmeConfiguration
  // );
  // router.delete(
  //   "/deleteEsmeConfiguration/:id",
  //   controller.deleteEsmeConfiguration
  // );
};
