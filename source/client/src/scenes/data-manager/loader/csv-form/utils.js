export function userMustNotInsertTid(mapping, mappingCube) {
  return mapping === null || (
    mappingCube !== null && (
      mappingCube.Attributes.filter(attr => attr.IsTid).length === 0 ||
      mapping.Components
        .filter(comp =>
          comp.CubeComponentCode === mappingCube.Attributes.filter(attr => attr.IsTid)[0].Code)
        .length > 0
    )
  );
}
