import React from "react";
import { Link } from "react-router-dom";

export function EventLink({ name, slug }) {
    return <Link {...{
        to: `/events/${slug}`
    }}>{name}</Link>;
}