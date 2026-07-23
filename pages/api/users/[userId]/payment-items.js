import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {
    AddTenantPaymentItem,
    DeleteTenantPaymentItem,
    GetAllTenantPaymentItems,
    UpdateTenantPaymentItem
} from "../../../../lib/db/users/tenantPaymentItems";

const handler = withIronSessionApiRoute(async (req, res) => {
        if (!req.session?.user?.isLoggedIn) {
            res.status(403).send();
            return;
        }

        const {site} = req.query;
        const userId = parseInt(req.query.userId);

        // Check if user is admin for this site
        if (!req.session.user.admin?.includes(site)) {
            res.status(403).send();
            return;
        }

        switch (req.method) {
            case "GET":
                try {
                    const items = await GetAllTenantPaymentItems(site, userId);
                    res.status(200).json(items);
                } catch (e) {
                    console.error(`${new Date().toISOString()} - Error in GET /api/users/${userId}/payment-items:`, e);
                    res.status(500).json({error: e.message});
                }
                return;

            case "POST":
                try {
                    const {description, amount, dueDate} = req.body;

                    if (!description || !amount) {
                        res.status(400).json({error: "Description and amount are required"});
                        return;
                    }

                    await AddTenantPaymentItem(
                        site,
                        userId,
                        description,
                        parseFloat(amount),
                        dueDate || null,
                        req.session.user.id
                    );

                    res.status(201).send();
                } catch (e) {
                    console.error(`${new Date().toISOString()} - Error in POST /api/users/${userId}/payment-items:`, e);
                    res.status(500).json({error: e.message});
                }
                return;

            case "PUT":
                try {
                    const {id, description, amount, dueDate} = req.body;

                    if (!id || !description || !amount) {
                        res.status(400).json({error: "ID, description, and amount are required"});
                        return;
                    }

                    await UpdateTenantPaymentItem(
                        id,
                        description,
                        parseFloat(amount),
                        dueDate || null
                    );

                    res.status(200).send();
                } catch (e) {
                    console.error(`${new Date().toISOString()} - Error in PUT /api/users/${userId}/payment-items:`, e);
                    res.status(500).json({error: e.message});
                }
                return;

            case "DELETE":
                try {
                    const {id} = req.body;

                    if (!id) {
                        res.status(400).json({error: "ID is required"});
                        return;
                    }

                    await DeleteTenantPaymentItem(id, req.session.user.id);
                    res.status(204).send();
                } catch (e) {
                    console.error(`${new Date().toISOString()} - Error in DELETE /api/users/${userId}/payment-items:`, e);
                    res.status(500).json({error: e.message});
                }
                return;

            default:
                res.status(405).send();
        }
    },
    ironOptions
);

export default handler;

