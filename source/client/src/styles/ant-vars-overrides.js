const constants = require('./constants');

const getAntVarsOverrides = () => ({
  "@primary-color": "red",
  "@form-item-margin-bottom": "16px",
  "@zindex-modal": constants.Z_INDEX_MODAL,
  "@zindex-modal-mask": constants.Z_INDEX_MODAL
});

module.exports = getAntVarsOverrides;