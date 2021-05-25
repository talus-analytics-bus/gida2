import React, { useState, useEffect } from "react";
import { Loading } from "../../common";
import { Outbreak } from "../../misc/Queries";
import { EventLink } from "./EventLink";

/**
 * Render list of PHEICs hyperlinked to their respective PHEIC details pages.
 */
export default function PheicList() {
    const [data, setData] = useState(null);
    const loaded = data !== null;
    useEffect(() => {
        // load outbreak data
        if (!loaded) getData(setData);
    }, [data]);
    return (
        <Loading {...{ loaded }}>
            <ul>
                {loaded &&
                    data.map(({ name, slug }) => (
                        <li>
                            <EventLink {...{ name, slug }} />
                        </li>
                    ))}
            </ul>
        </Loading>
    );
}

async function getData(setData) {
    const results = await Outbreak({ format: "names_by_id" });
    const newData = [];
    for (const id in results) {
        newData.push({
            name: results[id].name,
            slug: results[id].slug,
        });
    }
    newData.sort(function (a, b) {
        if (a.name > b.name) return -1;
        else return 1;
    });
    setData(newData);
}
