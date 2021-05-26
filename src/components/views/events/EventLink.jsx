import React from "react";
import { Link } from "react-router-dom";

export function EventLink({ name, slug, noLink = true }) {
    if (!noLink)
        return <Link {...{
            to: `/events/${slug}`
        }}>{name}</Link>;
    else return name;
}
