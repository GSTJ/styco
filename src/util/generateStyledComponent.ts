import { workspace } from "vscode";
import { Property, IStyleAttribute } from "./parseDocument";
import generate from "@babel/generator";
import {
  variableDeclaration,
  variableDeclarator,
  identifier,
  taggedTemplateExpression,
  memberExpression,
  callExpression,
  templateLiteral,
  templateElement,
} from "@babel/types";

const camelCaseToKebabCase = (input: string) => {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] === input[i].toUpperCase()) {
      output += "-" + input[i].toLowerCase();
      continue;
    }
    output += input[i];
  }

  return output;
};

const getUnits = (propertyName: string) => {
  const unitlessUnits = /flex/;
  if (unitlessUnits.test(propertyName)) return "";
  return "px";
};

const nativeHorizontalStyles = /-horizontal/g;
const nativeVerticalStyles = /-vertical/g;

const getMultipleValues = (prop: Property) => {
  if (nativeHorizontalStyles.test(prop.key)) {
    return `0 ${prop.value}`;
  }

  if (nativeVerticalStyles.test(prop.key)) {
    return `${prop.value} 0`;
  }

  return prop.value;
};

const stringifyStyles = (prop: Property) => {
  prop.key = camelCaseToKebabCase(prop.key);

  const unit = getUnits(prop.key);

  prop.value += unit;
  prop.value = getMultipleValues(prop);

  prop.key = prop.key
    .replace(nativeHorizontalStyles, "")
    .replace(nativeVerticalStyles, "");

  return `  ${prop.key}: ${prop.value}`;
};

export const generateStyleBlock = (properties: Property[]) => {
  let stringifiedStyles = properties.map(stringifyStyles);

  if (workspace.getConfiguration("styco").get("orderStyleByName")) {
    stringifiedStyles = stringifiedStyles.sort();
  }

  return `\n${stringifiedStyles.join(";\n")};\n`;
};

export const generateStyledComponent = (
  elementName: string,
  stycoName: string,
  styleAttr: IStyleAttribute | null
) => {
  const styleString =
    styleAttr !== null ? generateStyleBlock(styleAttr.properties) : "";

  return generate(
    variableDeclaration("const", [
      variableDeclarator(
        identifier(stycoName),
        taggedTemplateExpression(
          // Is default tag? just concat with a '.', otherwise wrap with '()'
          elementName[0] === elementName[0].toLowerCase()
            ? memberExpression(identifier("styled"), identifier(elementName))
            : callExpression(identifier("styled"), [identifier(elementName)]),
          templateLiteral([templateElement({ raw: styleString })], [])
        )
      ),
    ])
  ).code;
};
