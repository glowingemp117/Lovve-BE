const express = require("express");
const { UsersModel, BusinessUsersModel } = require("../models");
const { UsersController } = require("../controllers");
const {
  validatorMiddleware,
  authMiddleware,
  accessMiddleware,
  mongooseIdMiddleware,
} = require("../middleware");
const { accessConstants } = require("../constants");

const router = express.Router();

router.get("/me", authMiddleware, UsersController.getLoggedInUserInformation);

router.post(
  "/login",
  (req, res, next) => {
    validatorMiddleware(
      req,
      res,
      next,
      UsersModel.validateLoginRequest(req.body)
    );
  },
  UsersController.loginUser
);

router.post(
  "/",
  (req, res, next) => {
    if (req.body.businessId || req.body.userId || req.body.roleId) {
      validatorMiddleware(
        req,
        res,
        next,
        BusinessUsersModel.validateCreateRequest(req.body),
        UsersModel.validateCreateRequest(req.body)
      );
    } else {
      validatorMiddleware(
        req,
        res,
        next,
        UsersModel.validateCreateRequest(req.body)
      );
    }
  },
  UsersController.createUser
);

router.get(
  "/",
  (req, res, next) => {
    accessMiddleware({
      req,
      res,
      next,
      allowedRoles: accessConstants.aclConstants.users.getAll,
    });
  },
  UsersController.getUsers
);

router.get(
  "/:id",
  (req, res, next) => {
    accessMiddleware({
      req,
      res,
      next,
      allowedRoles: accessConstants.aclConstants.users.getSpecificUser,
    });
  },
  UsersController.getUser
);

router.put(
  "/:id",
  (req, res, next) => {
    accessMiddleware({
      req,
      res,
      next,
      allowedRoles: accessConstants.aclConstants.users.updateUser,
    });
  },
  UsersController.updateUser
);

router.delete(
  "/:id",
  (req, res, next) => {
    accessMiddleware({
      req,
      res,
      next,
      allowedRoles: accessConstants.aclConstants.users.deleteUser,
    });
  },
  UsersController.deleteUser
);

module.exports = router;
