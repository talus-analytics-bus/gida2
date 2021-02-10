import React, { FunctionComponent } from "react";
import styles from "./legendordinal.module.scss";
import classNames from "classnames";
import Shape, { ShapeType } from "../Shape/Shape";
import { formatValue } from "../../../../misc/Util";

type ValueLabelProps = {
  value: string;
};

export const getLabel = (value: string) => {
  const valueNum: number = parseFloat(value);
  if (isNaN(valueNum)) return value;
  else {
    const units: boolean = false;
    const round: boolean = true;
    return formatValue(value, "disbursed_funds", units, round);
  }
};

const ValueLabel: FunctionComponent<ValueLabelProps> = ({ value }) => {
  return <>{getLabel(value)}</>;
};

export default ValueLabel;
