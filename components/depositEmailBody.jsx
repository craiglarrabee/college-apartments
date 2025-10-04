import PageContent from "./pageContent";
import React from "react";

export const DepositEmailBody = function ({
                                              company,
                                              tenant,
                                              header,
                                              site,
                                              page,
                                              canEdit,
                                              body,
                                              leaseId,
                                              semester,
                                              userId
                                          }) {

    const today = new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});

    return (
        <>
            <div>Hello {tenant ? `${tenant.name}:` : "___________:"}</div>
            <br/>
            <PageContent
                initialContent={body}
                site={site}
                page={page}
                name="body"
                canEdit={canEdit}/>
        </>
    );
}