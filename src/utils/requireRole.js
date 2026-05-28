export const requireRole = (user, roles) => {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!roles.includes(user.role)) {
    throw new Error("Access denied");
  }
};
