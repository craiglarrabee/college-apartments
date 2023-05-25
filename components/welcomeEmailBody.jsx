import PageContent from "./pageContent";
import React from "react";

export const WelcomeEmailBody = function ({company, tenant, header, site, page, canEdit, body, footer}) {

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
            <PageContent
                initialContent={footer}
                site={site}
                page={page}
                name="footer"
                canEdit={canEdit}/>
        </>
    );
}