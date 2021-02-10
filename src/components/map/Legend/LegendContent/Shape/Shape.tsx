import React, { FunctionComponent } from "react";
import styles from "./shape.module.scss";
import classNames from "classnames";

export enum ShapeType {
  Rectangle = "RECTANGLE",
  Gradient = "GRADIENT",
}

type ShapeProps = {
  type: ShapeType;
  color: string;
};

const getShapeStyle = (fill: string) => {
  if (fill.includes(":")) {
    const [color, pattern] = fill.split(":");
    if (pattern.startsWith("striped")) {
      let patternColor;
      try {
        patternColor = pattern.split("-")[1];
      } catch {
        console.error(
          'No pattern color provided, must provide as "blue:striped-green", etc.'
        );
      }
      return {
        background: `repeating-linear-gradient(-45deg, ${color}, ${color} 8px, ${patternColor} 8px, ${patternColor} 10px)`,
        border: `1px solid ${patternColor}`,
      };
    } else if (pattern.startsWith("gradient")) {
      let patternColors: string[] = ["", ""];
      try {
        patternColors = pattern.split("-").slice(1, 3);
      } catch {
        console.error(
          'No pattern color provided, must provide as "blue:gradient-green-red", etc.'
        );
      }
      return {
        background: `linear-gradient(90deg, ${patternColors[0]}, ${
          patternColors[1]
        })`,
      };
    } else {
      console.error("Unknown fill pattern: " + pattern);
    }
  } else {
    return { backgroundColor: fill };
  }
};

const getShapeComponent = (type: ShapeType, color: string) => {
  return (
    <div
      style={getShapeStyle(color)}
      className={classNames(styles.shape, styles[type.toString()])}
    />
  );
};

export const Shape: FunctionComponent<ShapeProps> = ({ type, color }) => {
  // JSX //
  return getShapeComponent(type, color);
};

export default Shape;
