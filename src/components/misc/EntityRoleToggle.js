import React from "react";
import { Link } from "react-router-dom";
import RadioToggle from "./RadioToggle.js";
import styles from "./entityroletoggle.module.scss";
import classNames from "classnames";

const defs = (
  <defs>
    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
      <feColorMatrix
        in="blur"
        result="matrixOut"
        values="
        0 0 0 0 0.1553784860557769
        0 0 0 0 0.3346613545816733
        0 0 0 0 0.5099601593625498
        0 0 0 1 0
      "
      />
      <feMerge>
        <feMergeNode in="matrixOut" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="dropShadowCountry" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
      <feColorMatrix
        in="blur"
        result="matrixOut"
        values="
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 1 0
      "
      />
      <feMerge>
        <feMergeNode in="matrixOut" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="toWhite">
      <feColorMatrix
        in="SourceGraphic"
        values="
  1 0 0 0 1
  0 1 0 0 1
  0 0 1 0 1
  0 0 0 1 0
"
      />
    </filter>
  </defs>
);
/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method EntityRoleToggle
 */
const EntityRoleToggle = ({ entityRole, redirectUrlFunc, callback }) => {
  if (redirectUrlFunc === undefined) redirectUrlFunc = v => null;
  const onClick = (v, jsx) => {
    return <Link to={redirectUrlFunc(v)}>{jsx}</Link>;
  };

  const newOne = (
    <svg className={styles.entityRoleToggle}>
      {defs}
      <g class="chart">
        {onClick(
          "funder",
          <g
            onClick={() => {
              if (callback) callback("funder");
            }}
            className={classNames(styles.funder, {
              [styles.active]: entityRole === "funder",
            })}
          >
            <path
              d="M3.52,30.29A2.77,2.77,0,0,1,.76,27.52v-24A2.77,2.77,0,0,1,3.52.76H91.75A4.92,4.92,0,0,1,94.2,1.93a.3.3,0,0,1,.08.08l11.38,12.31a.76.76,0,0,1,0,1L94.09,29a2.77,2.77,0,0,1-2.34,1.32Z"
              class="light"
            />
            <g class="label" transform="translate(7, 22)">
              <text>$ Funder</text>
            </g>
          </g>
        )}
        {onClick(
          "recipient",
          <g
            onClick={() => {
              if (callback) callback("recipient");
            }}
            className={classNames(styles.recipient, {
              [styles.active]: entityRole === "recipient",
            })}
            transform="translate(100)"
          >
            <path
              d="M2.22,30.07a.71.71,0,0,1-.55-1.14L12.55,15.27c.11-.11.14-.18.14-.24a.28.28,0,0,0-.09-.18L1.09,2l0,0A.72.72,0,0,1,.71,1.3.71.71,0,0,1,1.25.73c.1,0,.1,0,5.21,0C29.11.7,120,.78,120,.78a2.54,2.54,0,0,1,1.8.75,2.57,2.57,0,0,1,.75,1.8l0,24.31A2.55,2.55,0,0,1,120,30.19Z"
              class="light"
            />
            <g class="label" transform="translate(24, 22)">
              <text>$ Recipient</text>
            </g>
          </g>
        )}
      </g>
    </svg>
  );

  return newOne;
};

export const FunderIcon = () => {
  return (
    <svg className={styles.entityRoleToggle}>
      {defs}
      <g class="chart">
        <g
          className={classNames(styles.funder, {
            [styles.active]: true,
          })}
        >
          <path
            d="M3.52,30.29A2.77,2.77,0,0,1,.76,27.52v-24A2.77,2.77,0,0,1,3.52.76H91.75A4.92,4.92,0,0,1,94.2,1.93a.3.3,0,0,1,.08.08l11.38,12.31a.76.76,0,0,1,0,1L94.09,29a2.77,2.77,0,0,1-2.34,1.32Z"
            class="light"
          />
          <g class="label" transform="translate(7, 22)">
            <text>$ Funder</text>
          </g>
        </g>
      </g>
    </svg>
  );
};

export const RecipientIcon = () => {
  return (
    <svg className={styles.entityRoleToggle}>
      {defs}
      <g class="chart">
        <g
          className={classNames(styles.recipient, {
            [styles.active]: true,
          })}
        >
          <path
            d="M2.22,30.07a.71.71,0,0,1-.55-1.14L12.55,15.27c.11-.11.14-.18.14-.24a.28.28,0,0,0-.09-.18L1.09,2l0,0A.72.72,0,0,1,.71,1.3.71.71,0,0,1,1.25.73c.1,0,.1,0,5.21,0C29.11.7,120,.78,120,.78a2.54,2.54,0,0,1,1.8.75,2.57,2.57,0,0,1,.75,1.8l0,24.31A2.55,2.55,0,0,1,120,30.19Z"
            class="light"
          />
          <g class="label" transform="translate(24, 22)">
            <text>$ Recipient</text>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default EntityRoleToggle;
