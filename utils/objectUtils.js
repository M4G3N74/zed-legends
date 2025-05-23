/**
 * Safe replacement for deprecated util._extend
 * @param {Object} target - The target object to extend
 * @param {Object} source - The source object
 * @returns {Object} - The extended object
 */
export function extendObject(target, source) {
  return Object.assign({}, target, source);
}