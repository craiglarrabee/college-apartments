// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {ReceiveDeposit} from "../../../../lib/db/users/application";
import {AddUserPayment, MarkPaymentReviewed} from "../../../../lib/db/users/userPayment";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                // TODO: make payment
                const payResp =
                    {
                        transactionResponse: {
                            responseCode: "1",
                            authCode: "HH5414",
                            avsResultCode: "P",
                            cvvResultCode: "",
                            cavvResultCode: "",
                            transId: "1234567890",
                            refTransID: "1234567890",
                            transHash: "FE3CE11E9F7670D3ECD606E455B7C222",
                            accountNumber: "XXXX0015",
                            accountType: "Mastercard",
                            messages: [
                                {
                                    code: "1",
                                    description: "This transaction has been approved."
                                }
                            ]
                        },
                        refId: "123456",
                        messages: {
                            resultCode: "Ok",
                            message: [
                                {
                                    code: "I00001",
                                    text: "Successful."
                                }
                            ]
                        }
                    }
                // record payment
                const data = {...req.body};
                data.transId = payResp.transactionResponse.transId;
                data.authCode = payResp.transactionResponse.authCode;
                data.resultCode = payResp.messages?.resultCode;
                data.resultMessage = payResp.messages?.message[0]?.text;
                data.accountType = payResp.transactionResponse.accountType;
                data.accountNumber = payResp.transactionResponse.accountNumber;
                await AddUserPayment(req.query.site, req.query.userId, data);
                res.body = data;
                res.status(200).send();
                return;
            case "PUT":
                await MarkPaymentReviewed(req.body.id);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.log(e);
    }
}, ironOptions);

export default handler;
