/*@jsxRuntime automatic @jsxImportSource preact*/
import { useMDXComponents as _provideComponents } from "@mdx-js/preact";
import MyComponent from "./Component.tsx";
function _createMdxContent(props) {
  const _components = Object.assign(
    {
      h1: "h1",
    },
    _provideComponents(),
    props.components,
  );
  return (
    <>
      <_components.h1>{"Test mdx"}</_components.h1>
      {"\n"}
      <MyComponent hello={"test test"} />
    </>
  );
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = Object.assign(
    {},
    _provideComponents(),
    props.components,
  );
  return MDXLayout
    ? (
      <MDXLayout {...props}>
        <_createMdxContent {...props} />
      </MDXLayout>
    )
    : _createMdxContent(props);
}
export default MDXContent;
