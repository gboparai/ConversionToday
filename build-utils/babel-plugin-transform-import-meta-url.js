module.exports = function ({ types: t, template }) {
  // JSquash codec runtime uses import.meta.url to resolve wasm paths.
  // In this webpack 4 setup we rewrite to the site root so nested routes
  // like /compression/png still resolve wasm assets from /<file>.wasm.
  const replacement = template.expression(
    '(typeof self !== "undefined" && self.location && self.location.origin ? self.location.origin + "/" : ((typeof document !== "undefined" && document.location && document.location.origin) ? document.location.origin + "/" : "/"))'
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
        // Some generated codec glue code conditionally assigns to import.meta.url.
        // After rewriting import.meta.url to a runtime location expression, assignment
        // is invalid, so replace the assignment expression with its RHS value.
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
