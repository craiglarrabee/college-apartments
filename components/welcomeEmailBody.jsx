import PageContent from "./pageContent";
import React from "react";

export const WelcomeEmailBody = function ({company, tenant, header, site, page, canEdit, body}) {

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
            <div>Dear {tenant ? `${tenant.first_name} ${tenant.last_name}:` : "___________:"}</div>
            <br/>
            <PageContent
                initialContent={body}
                site={site}
                page={page}
                name="body"
                canEdit={canEdit}/>
            <div>----------------- **IMPORTANT** -----------------------------------------------<br/>
                Follow this link to electronically complete and submit your <a
                    href="https://snowcollegeapartments.com/suu/lease.php?sid=45a2<<sid>>67z3">Lease</a><br/>
                <br/>
                Follow this link to view your <a
                    href="https://snowcollegeapartments.com/suu/roomates.php?sid=45a2<<sid>>67z3">room assignment
                    and roomates</a><br/>
            </div>
        </>
    );
}