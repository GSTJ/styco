import { generateStyleBlock } from "../util/generateStyledComponent";
import { parseDocument } from "../util/parseDocument";

jest.mock("vscode");

test("simple transformation should work", () => {
  const t = `
        <div style={{
            marginTop: '12px'
        }}/>
    `;
  const { selectedElement, elementName, insertPosition, styleAttr } =
    parseDocument(t, 10);

  expect(selectedElement).toBeDefined();
  expect(styleAttr).toBeDefined();
  expect(styleAttr?.properties).toHaveLength(1);
  expect(styleAttr?.properties[0].key).toBe("marginTop");
  expect(styleAttr?.properties[0].value).toBe("12px");
});

test("unit infer should work", () => {
  const properties = [{ key: "marginTop", value: "10" }];

  const styleBlock = generateStyleBlock(properties);

  expect(styleBlock).toBe("\n  margin-top: 10px;\n");
});

describe("native styles", () => {
  test("vertical styles should be parsed correctly", () => {
    const properties = [{ key: "marginVertical", value: "10" }];

    const styleBlock = generateStyleBlock(properties);

    expect(styleBlock).toBe("\n  margin: 10px 0;\n");
  });

  test("horizontal styles should be parsed correctly", () => {
    const properties = [{ key: "marginHorizontal", value: "10" }];

    const styleBlock = generateStyleBlock(properties);

    expect(styleBlock).toBe("\n  margin: 0 10px;\n");
  });
});
