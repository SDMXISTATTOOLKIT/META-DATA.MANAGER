export const METADATA_API_PING = "METADATA_API_PING";

export const pingMetadataApi = (label, baseUrl) => ({
  type: METADATA_API_PING,
  label,
  baseUrl
});