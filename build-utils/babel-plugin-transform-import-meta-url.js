module.exports = function ({ types: t }) {
  // JSquash codec runtime uses import.meta.url to resolve wasm paths.
  // In this webpack 4 setup we rewrite to the site root so nested routes
  // like /compression/png still resolve wasm assets from /<file>.wasm.
  function replacement() {
    const selfOrigin = t.memberExpression(
      t.memberExpression(t.identifier("self"), t.identifier("location")),
      t.identifier("origin")
    );
    const documentBaseUri = t.memberExpression(
      t.identifier("document"),
      t.identifier("baseURI")
    );

    return t.conditionalExpression(
      t.logicalExpression(
        "&&",
        t.binaryExpression("!==", t.unaryExpression("typeof", t.identifier("self")), t.stringLiteral("undefined")),
        t.logicalExpression(
          "&&",
          t.memberExpression(t.identifier("self"), t.identifier("location")),
          t.logicalExpression(
            "&&",
            selfOrigin,
            t.binaryExpression("!==", selfOrigin, t.stringLiteral("null"))
          )
        )
      ),
      t.binaryExpression("+", selfOrigin, t.stringLiteral("/")),
      t.conditionalExpression(
        t.logicalExpression(
          "&&",
          t.binaryExpression("!==", t.unaryExpression("typeof", t.identifier("document")), t.stringLiteral("undefined")),
          documentBaseUri
        ),
        t.callExpression(
          t.memberExpression(
            t.newExpression(t.identifier("URL"), [t.stringLiteral("/"), documentBaseUri]),
            t.identifier("toString")
          ),
          []
        ),
        t.stringLiteral("/")
      )
    );
  }

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
