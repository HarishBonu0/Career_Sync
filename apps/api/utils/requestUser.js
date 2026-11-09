import mongoose from 'mongoose';

/**
 * Merge authenticated user identity into persistence payloads.
 */
export function withAuthenticatedUser(req, fields = {}) {
  if (!req.user) return fields;
  const id = req.user.id;
  return {
    ...fields,
    user: id,
    userId: id.toString(),
    userEmail: req.user.email || fields.userEmail,
  };
}

export function userOwnsParam(req, paramUserId) {
  if (!req.user || !paramUserId) return false;
  const ownId = req.user.id.toString();
  if (paramUserId === ownId) return true;
  if (req.user.email && paramUserId.toLowerCase() === req.user.email.toLowerCase()) return true;
  if (mongoose.Types.ObjectId.isValid(paramUserId) && paramUserId.toString() === ownId) {
    return true;
  }
  return false;
}
