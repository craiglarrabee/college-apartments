import PageContent from "./pageContent";
import React from "react";

export const WelcomeEmailBody = function ({company, tenant, header, site, page, canEdit, body, leaseId, year, semester}) {

    const today = new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});

    return (
        <>
            <div>{company}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{today}</div>
            <PageContent
                initialContent={header}
                site={site}
                page={page}
                name="header"
                canEdit={canEdit}/>
            <div>Dear {tenant ? `${tenant.name}:` : "___________:"}</div>
            <br/>
            <PageContent
                initialContent={body}
                site={site}
                page={page}
                name="body"
                canEdit={canEdit}/>
            <div>----------------- **IMPORTANT** -----------------------------------------------<br/>
                Follow this link to electronically complete and submit your <a
                    href={`https://uca.snowcollegeapartments.com/leases/${leaseId}?site=${site}`}>Lease</a><br/>
                <br/>
                Follow this link to view your <a
                    href={`https://uca.snowcollegeapartments.com/assignments/${year}/${semester}?site=${site}`}>room assignment
                    and roomates</a><br/>
            </div>
        </>
    );
}