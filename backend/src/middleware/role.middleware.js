function normalizeRoles(roles) {
  return roles.flat().filter(Boolean);
}

function roleMiddleware(...allowedRoles) {
  const roles = normalizeRoles(allowedRoles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (roles.length === 0) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    return next();
  };
}

function userTypeMiddleware(...allowedTypes) {
  const types = normalizeRoles(allowedTypes);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (types.length === 0 || types.includes(req.user.authType)) {
      return next();
    }

    return res.status(403).json({ message: "Invalid user type" });
  };
}

function allowSelfOrRoles(getOwnerId, ...allowedRoles) {
  const roleGuard = roleMiddleware(...allowedRoles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ownerId =
      typeof getOwnerId === "function" ? getOwnerId(req) : req.params[getOwnerId];

    if (ownerId && ownerId === req.user.id) {
      return next();
    }

    return roleGuard(req, res, next);
  };
}

module.exports = {
  roleMiddleware,
  userTypeMiddleware,
  allowSelfOrRoles,
  authorize: roleMiddleware,
  requireRole: roleMiddleware,
  requireUserType: userTypeMiddleware,
};
