module.exports = function ({ types: t, template }) {
  const replacement = template.expression(
    '(typeof document !== "undefined" && document.baseURI) ? document.baseURI : ((typeof self !== "undefined" && self.location) ? self.location.href : "")'
  );

  function isImportMeta(node) {
    return (
      t.isMetaProperty(node) &&
      t.isIdentifier(node.meta, { name: "import" }) &&
      t.isIdentifier(node.property, { name: "meta" })
    );
  }

  function isImportMetaUrl(node) {
    return (
      t.isMemberExpression(node) &&
      isImportMeta(node.object) &&
      t.isIdentifier(node.property, { name: "url" })
    );
  }

  return {
    name: "transform-import-meta-url",
    visitor: {
      AssignmentExpression(path) {
        if (isImportMetaUrl(path.node.left)) {
          path.replaceWith(path.node.right);
        }
      },
      MemberExpression(path) {
        if (isImportMetaUrl(path.node)) {
          path.replaceWith(replacement());
        }
      },
    },
  };
};
